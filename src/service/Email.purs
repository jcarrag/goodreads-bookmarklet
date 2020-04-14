module Service.Email
  ( Email(..)
  , emailInterpreter
  , loggingInterpreter
  ) where

import Control.Apply ((*>))
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

type Name
  = String

newtype Email f
  = Email
  { send :: String -> Book ( downloaded :: B.Buffer, converted :: Maybe B.Buffer ) -> String -> String -> f Unit
  , sendError :: String -> String -> String -> f Unit
  }

emailInterpreter :: Email Aff
emailInterpreter =
  Email
    { send: sendBookEmail
    , sendError: sendErrorEmail
    }

loggingInterpreter :: forall f. MonadError Error f => MonadEffect f => Email f -> Email f
loggingInterpreter (Email underlying) =
  Email
    underlying
      { send =
        \mailjetUser book from to -> do
          log "Sending email"
          result <- underlying.send mailjetUser book from to `logError` "Failed to send email"
          log "Sent email"
          pure result
      , sendError =
        \mailjetUser query to -> do
          log "Sending error email"
          result <- underlying.sendError mailjetUser query to `logError` "Failed to send error email"
          log "Sent error email"
          pure result
      }
  where
  logError fa msg = fa `catchError` (\e -> (log $ msg <> ": " <> show e) *> throwError e)

sendErrorEmail :: String -> String -> String -> Aff Unit
sendErrorEmail mailjetUser query to = do
  responseCode <- sendEmail' mailjetUser body
  log $ "sent error email (" <> show responseCode <> ") from: " <> from <> ", to: " <> to
  where
  from = "test@email.com"

  body =
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
      <> quote ("Unable to send '" <> query <> "' to your kindle")
      <> """,
          "Attachments": []
        }
      ]
    }
    """

sendBookEmail :: String -> Book ( downloaded :: B.Buffer, converted :: Maybe B.Buffer ) -> String -> String -> Aff Unit
sendBookEmail mailjetUser (Book { downloaded, converted, title }) from to = do
  attachment <- liftEffect $ B.toString E.Base64 $ fromMaybe downloaded converted
  responseCode <- sendEmail' mailjetUser $ body attachment
  log $ "sent book email (" <> show responseCode <> ") from: " <> from <> ", to: " <> to
  where
  fileName' = title <> ".mobi"

  body attachment =
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
      <> quote fileName'
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
