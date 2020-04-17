module Service.Email
  ( Email(..)
  , toEmailInterpreter
  , loggingInterpreter
  , testEmailInterpreter
  ) where

import Control.Apply ((*>))
import Control.Monad (void)
import Control.Monad.Error.Class (class MonadError, catchError, throwError)
import Data.Book (Book(..))
import Data.Maybe (Maybe, fromMaybe)
import Effect.Aff (Aff)
import Effect.Class (class MonadEffect, liftEffect)
import Effect.Class.Console (log)
import Effect.Exception (Error)
import Milkis as M
import Milkis.Impl.Node (nodeFetch)
import Node.Buffer as B
import Node.Encoding as E
import Prelude (Unit, bind, discard, pure, show, ($), (<>))

newtype Email f
  = Email
  { send :: Book ( downloaded :: B.Buffer, converted :: Maybe B.Buffer ) -> String -> String -> f Unit
  , sendError :: String -> String -> f Unit
  }

toEmailInterpreter :: String -> Email Aff
toEmailInterpreter mailjetUser =
  Email
    { send: sendBookEmail mailjetUser
    , sendError: sendErrorEmail mailjetUser
    }

testEmailInterpreter :: forall f. MonadEffect f => Email f
testEmailInterpreter =
  Email
    { send: \(Book { title }) from to -> log $ buildSendBookEmail "attachment" title from to
    , sendError: \title to -> log $ buildSendErrorEmail title "test@email.com" to
    }

loggingInterpreter :: forall f. MonadError Error f => MonadEffect f => Email f -> Email f
loggingInterpreter (Email underlying) =
  Email
    underlying
      { send =
        \book from to -> do
          log "Sending book email"
          result <- underlying.send book from to `logError` "Failed to send book email"
          log "Successfully sent book email"
          pure result
      , sendError =
        \query to -> do
          log "Sending error email"
          result <- underlying.sendError query to `logError` "Failed to send error email"
          log "Succssfully sent error email"
          pure result
      }
  where
  logError fa msg = fa `catchError` (\e -> (log $ msg <> ": " <> show e) *> throwError e)

sendErrorEmail :: String -> String -> String -> Aff Unit
sendErrorEmail mailjetUser query to = do
  void $ sendEmail' mailjetUser $ buildSendErrorEmail query "test@test.com" to

buildSendErrorEmail :: String -> String -> String -> String
buildSendErrorEmail title from to =
  """
    {
      "Messages": [
        {
          "From": { "Email": """
    <> quote from
    <> """ },
          "To": [{ "Email": """
    <> quote to
    <> """ }],
          "TextPart": """
    <> quote ("Unable to send '" <> title <> "' to your kindle")
    <> """,
          "Attachments": []
        }
      ]
    }
    """

sendBookEmail :: String -> Book ( downloaded :: B.Buffer, converted :: Maybe B.Buffer ) -> String -> String -> Aff Unit
sendBookEmail mailjetUser (Book { downloaded, converted, title }) from to = do
  attachment <- liftEffect $ B.toString E.Base64 $ fromMaybe downloaded converted
  responseCode <- sendEmail' mailjetUser $ buildSendBookEmail attachment title from to
  log $ "sent book email (" <> show responseCode <> ") from: " <> from <> ", to: " <> to
  where
  fileName' = title <> ".mobi"

buildSendBookEmail :: String -> String -> String -> String -> String
buildSendBookEmail attachment filename from to =
  """
    {
      "Messages": [
        {
          "From": { "Email": """
    <> quote from
    <> """ },
          "To": [{ "Email": """
    <> quote to
    <> """ }],
          "TextPart": "Goodreads-bookmarklet error.",
          "Attachments": [
            {
              "Filename": """
    <> quote filename
    <> """,
              "ContentType": "text/plain",
              "Base64Content": """
    <> quote attachment
    <> """
            }
          ]
        }
      ]
    }
    """

sendEmail' :: String -> String -> Aff Int
sendEmail' mailjetUser body = do
  response <- fetch url $ opts
  pure $ M.statusCode $ response
  where
  fetch = M.fetch nodeFetch

  url = M.URL $ "https://" <> mailjetUser <> "@api.mailjet.com/v3.1/send"

  opts =
    { method: M.postMethod
    , headers: M.makeHeaders { "Content-Type": "application/json" }
    , body: body
    }

quote :: String -> String
quote s = "\"" <> s <> "\""
