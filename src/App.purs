module App (handleEvent) where

import Data.AwsEvent (AwsEvent(..))
import Data.Maybe (fromJust)
import Dotenv (loadFile)
import Effect (Effect)
import Effect.Aff (Aff, launchAff_)
import Effect.Class (liftEffect)
import Control.Monad.Error.Class (catchError)
import Node.Process (lookupEnv)
import Partial.Unsafe (unsafePartial)
import Prelude (Unit, bind, pure, ($))
import Service.Download (downloadBook)
import Service.Email (sendBookEmail, sendErrorEmail)

handleEvent :: AwsEvent -> Effect Unit
handleEvent (AwsEvent { queryStringParameters: { query, from, to } }) =
  launchAff_ do
    mailjetUser <- getMailjetUser
    downloadAndSendBook mailjetUser `catchError` (\_ -> sendErrorEmail mailjetUser query from)
  where
  downloadAndSendBook mailjetUser = do
    book <- downloadBook query
    sendBookEmail mailjetUser book from to

getMailjetUser :: Aff String
getMailjetUser = do
  _ <- loadFile
  userM <- liftEffect $ lookupEnv "MAILJET_USER"
  pure $ unsafePartial $ fromJust userM
