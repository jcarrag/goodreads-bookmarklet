module Main where

import Prelude
import App as A
import Data.AwsEvent (AwsEvent(..))
import Effect (Effect)
import Effect.Aff (launchAff_)
import Service.Config (Config(..), configInterpreter)
import Service.Convert as C
import Service.Download as D
import Service.Email as E

main :: Effect Unit
main =
  launchAff_ do
    config@(Config { mailjetUser }) <- configInterpreter
    let
      convert = C.convertInterpreter

      download = D.testDownloadInterpreter

      email = E.testEmailInterpreter --toEmailInterpreter mailjetUser
    A.toHandleEvent convert download email (awsEvent config)

awsEvent :: Config -> AwsEvent
awsEvent (Config c) =
  AwsEvent
    { queryStringParameters:
      { query: "epub"
      , from: "james@carragher.org"
      , to: "james@carragher.org"
      }
    }
