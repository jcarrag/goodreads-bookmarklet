module App (handleEvent) where

import Control.Monad.Error.Class (class MonadError, catchError)
import Data.AwsEvent (AwsEvent(..))
import Effect (Effect)
import Effect.Aff (launchAff_)
import Effect.Class (class MonadEffect)
import Effect.Exception (Error)
import Prelude (Unit, bind, ($))
import Service.Config (Config(..), configInterpreter)
import Service.Download (Download(..), downloadInterpreter)
import Service.Email as E

handleEvent :: AwsEvent -> Effect Unit
handleEvent e = launchAff_ $ toHandleEvent configInterpreter downloadInterpreter E.emailInterpreter e

toHandleEvent :: forall f. MonadEffect f => MonadError Error f => Config f -> Download f -> E.Email f -> AwsEvent -> f Unit
toHandleEvent (Config c) (Download d) emailInterpreter (AwsEvent { queryStringParameters: { query, from, to } }) = do
  mailjetUser <- c.mailjetUser
  downloadAndSendBook mailjetUser `catchError` (\_ -> e'.sendError mailjetUser query from)
  where
  (E.Email e') = E.loggingInterpreter emailInterpreter

  downloadAndSendBook mailjetUser = do
    book <- d.download query
    e'.send mailjetUser book from to
