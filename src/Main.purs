module Main where

import Prelude

import App as A
import AwsEvent (AwsEvent(..))
import Effect (Effect)


main :: Effect Unit
main = A.handleEvent awsEvent

awsEvent :: AwsEvent
awsEvent = AwsEvent { queryStringParameters: { query: "grapes of wrath john steinbeck"
                                             , from: "test@email.com"
                                             , to: "test@email.com" --"test@kindle.com"
                                             }
                    }
