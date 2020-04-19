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
import Service.Convert as C
import Service.Download as D
import Service.Email as E

awsHandleEvent :: AwsEvent -> Aff Unit
awsHandleEvent e = do
  Config { mailjetUser } <- configInterpreter
  toHandleEvent C.convertInterpreter D.downloadInterpreter (E.toEmailInterpreter mailjetUser) e

toHandleEvent :: forall f. MonadEffect f => MonadError Error f => C.Convert f -> D.Download f -> E.Email f -> AwsEvent -> f Unit
toHandleEvent convertInterpreter downloadInterpreter emailInterpreter (AwsEvent { queryStringParameters: { query, from, to } }) = do
  downloadAndSendBook `catchError` (\_ -> sendError query from)
  where
  (C.Convert { convert }) = C.loggingInterpreter convertInterpreter

  (D.Download { download }) = D.loggingInterpreter downloadInterpreter

  (E.Email { send, sendError }) = E.loggingInterpreter emailInterpreter

  downloadAndSendBook = do
    book <- download query
    convertedBook <- convert book
    send convertedBook from to
