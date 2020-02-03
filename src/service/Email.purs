module Service.Email
  ( sendBookEmail
  , sendErrorEmail
  ) where

import Prelude (Unit, bind, pure, show, ($), (<>))
import Data.Book (Book(..))
import Data.Maybe (Maybe, fromMaybe)
import Effect.Aff (Aff)
import Effect.Class (liftEffect)
import Effect.Class.Console (log)
import Milkis as M
import Milkis.Impl.Node (nodeFetch)
import Node.Buffer as B
import Node.Encoding as E

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
