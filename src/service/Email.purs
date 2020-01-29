module Service.Email (sendEmail) where

import Prelude (Unit, bind, pure, show, ($), (<>))
import Data.Book (Book(..))
import Data.Maybe (Maybe, fromJust, fromMaybe)
import Dotenv (loadFile)
import Effect.Aff (Aff)
import Effect.Class (liftEffect)
import Effect.Class.Console (log)
import Milkis as M
import Milkis.Impl.Node (nodeFetch)
import Node.Buffer as B
import Node.Encoding as E
import Node.Process (lookupEnv)
import Partial.Unsafe (unsafePartial)

sendEmail :: Book ( downloaded :: B.Buffer, converted :: Maybe B.Buffer ) -> String -> String -> Aff Unit
sendEmail (Book { downloaded, converted, title }) from to = do
  mailjetUser <- getMailjetUser
  responseCode <- sendEmail' from to mailjetUser title $ fromMaybe downloaded converted
  log $ "sent email (" <> show responseCode <> ") from: " <> from <> ", to: " <> to

getMailjetUser :: Aff String
getMailjetUser = do
  _ <- loadFile
  userM <- liftEffect $ lookupEnv "MAILJET_USER"
  pure $ unsafePartial $ fromJust userM

sendEmail' :: String -> String -> String -> String -> B.Buffer -> Aff Int
sendEmail' from to mailjetUser fileName attachment = do
  attachmentB64 <- liftEffect $ B.toString E.Base64 attachment
  response <- fetch url $ opts attachmentB64
  pure $ M.statusCode $ response
  where
  fileName' = fileName <> ".mobi"

  fetch = M.fetch nodeFetch

  url = M.URL $ "https://" <> mailjetUser <> "@api.mailjet.com/v3.1/send"

  opts attachmentB64 =
    { method: M.postMethod
    , headers: M.makeHeaders { "Content-Type": "application/json" }
    , body:
      """
        {
          "Messages": [
            {
              "From": { "Email": """
        <> "\""
        <> from
        <> "\""
        <> """ },
              "To": [{ "Email": """
        <> "\""
        <> to
        <> "\""
        <> """ }],
              "TextPart": "Greetings from Mailjet.",
              "Attachments": [
                {
                  "Filename": """
        <> "\""
        <> fileName'
        <> "\""
        <> """,
                  "ContentType": "text/plain",
                  "Base64Content": """
        <> "\""
        <> attachmentB64
        <> "\""
        <> """
                }
              ]
            }
          ]
        }
        """
    }
