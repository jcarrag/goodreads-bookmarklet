module Main where

import Prelude
import App as A
import Data.AwsEvent (AwsEvent(..))
import Effect (Effect)
import Effect.Aff (launchAff_)
import Service.Config (Config(..), configInterpreter)
import Service.Download as D
import Service.Email as E

main :: Effect Unit
main =
  launchAff_ do
    config@(Config { mailjetUser }) <- configInterpreter
    let
      download = D.testDownloadInterpreter

      email = E.testEmailInterpreter
    A.toHandleEvent download email (awsEvent config)

awsEvent :: Config -> AwsEvent
awsEvent (Config c) =
  AwsEvent
    { queryStringParameters:
      { query: c.query
      , from: c.fromEmail
      , to: c.toEmail
      }
    }
