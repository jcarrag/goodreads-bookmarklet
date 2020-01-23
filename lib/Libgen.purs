module Libgen where

import Prelude

import Control.Promise (Promise, toAffE)
import Data.Generic.Rep (class Generic)
import Data.Generic.Rep.Show (genericShow)
import Data.Newtype (class Newtype, unwrap)
import Effect (Effect)
import Effect.Aff (Aff)

newtype Book = Book { extension :: String
                    , md5 :: String
                    , title :: String
                    , author :: String
                    }
derive instance genericBook :: Generic Book _
instance showBook :: Show Book where show = genericShow
derive instance newtypeBook :: Newtype Book _

foreign import _getMirror :: Effect (Promise String)
foreign import _search :: String -> String -> Effect (Promise (Array Book))
foreign import _getPreDownloadUrl :: String -> Effect (Promise (String))

getMirror :: Aff String
getMirror = toAffE _getMirror

search :: String -> String -> Aff (Array Book)
search mirror query = toAffE $ _search mirror query

getPreDownloadUrl :: Book -> Aff String
getPreDownloadUrl book = toAffE $ _getPreDownloadUrl $ _.md5 <<< unwrap $ book
