module AwsEvent where

import Prelude

import Data.Generic.Rep (class Generic)
import Data.Generic.Rep.Show (genericShow)
import Data.Newtype (class Newtype)


newtype AwsEvent = AwsEvent { queryStringParameters :: { query :: String
                                                       , from :: String
                                                       , to :: String
                                                       }
                            }

derive instance genericEvent :: Generic AwsEvent _
instance showEvent :: Show AwsEvent where show = genericShow
derive instance newtypeEvent :: Newtype AwsEvent _

