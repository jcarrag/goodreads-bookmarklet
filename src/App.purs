module App
  ( awsHandleEvent
  , toHandleEvent
  ) where

import Control.Monad.Error.Class (class MonadError, catchError)
import Data.AwsEvent (AwsEvent(..))
import Effect.Aff (Aff)
import Effect.Class (class MonadEffect)
import Effect.Exception (Error)
import Prelude (Unit, bind)
import Service.Config (Config(..), configInterpreter)
import Service.Download as D
import Service.Email as E

awsHandleEvent :: AwsEvent -> Aff Unit
awsHandleEvent e = do
  Config { mailjetUser } <- configInterpreter
  toHandleEvent D.downloadInterpreter (E.toEmailInterpreter mailjetUser) e

toHandleEvent :: forall f. MonadEffect f => MonadError Error f => D.Download f -> E.Email f -> AwsEvent -> f Unit
toHandleEvent downloadInterpreter emailInterpreter (AwsEvent { queryStringParameters: { query, from, to } }) = do
  downloadAndSendBook `catchError` (\_ -> e'.sendError query from)
  where
  (D.Download d') = D.loggingInterpreter downloadInterpreter

  (E.Email e') = E.loggingInterpreter emailInterpreter

  downloadAndSendBook = do
    book <- d'.download query
    e'.send book from to
