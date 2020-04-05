module App (handleEvent) where

import Control.Monad.Error.Class (class MonadError, catchError)
import Data.AwsEvent (AwsEvent(..))
import Effect (Effect)
import Effect.Aff (launchAff_)
import Effect.Exception (Error)
import Prelude (Unit, bind, ($))
import Service.Config (Config(..), configInterpreter)
import Service.Download (Download(..), downloadInterpreter)
import Service.Email (Email(..), emailInterpreter)

handleEvent :: AwsEvent -> Effect Unit
handleEvent e = launchAff_ $ toHandleEvent configInterpreter downloadInterpreter emailInterpreter e

toHandleEvent :: forall f. MonadError Error f => Config f -> Download f -> Email f -> AwsEvent -> f Unit
toHandleEvent (Config c) (Download d) (Email e) (AwsEvent { queryStringParameters: { query, from, to } }) = do
  mailjetUser <- c.mailjetUser
  downloadAndSendBook mailjetUser `catchError` (\_ -> e.sendError mailjetUser query from)
  where
  downloadAndSendBook mailjetUser = do
    book <- d.download query
    e.send mailjetUser book from to
