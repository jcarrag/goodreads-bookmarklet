module Libgen where

import Prelude

import Control.Promise (Promise, toAffE)
import Data.Generic.Rep (class Generic)
import Data.Generic.Rep.Show (genericShow)
import Data.Newtype (class Newtype, unwrap)
import Effect (Effect)
import Effect.Aff (Aff)

newtype Book r = Book { author :: String
                      , extension :: String
                      , md5 :: String
                      , filesize :: Number
                      , title :: String
                      | r
                      }
derive instance genericBook :: Generic (Book r) _
instance showBook :: Show (Book r) where show = genericShow <<< toBookShow

toBookShow :: forall r. Book r -> Book ()
toBookShow (Book book) = Book { author: book.author
                              , extension: book.extension
                              , md5: book.md5
                              , filesize: book.filesize
                              , title: book.title
                              }

derive instance newtypeBook :: Newtype (Book r) _

foreign import _getMirror :: Effect (Promise String)
foreign import _search :: forall r. String -> String -> Effect (Promise (Array (Book r)))
foreign import _getPreDownloadUrl :: String -> Effect (Promise (String))

getMirror :: Aff String
getMirror = toAffE _getMirror

search :: String -> String -> Aff (Array (Book ()))
search mirror query = toAffE $ _search mirror query

getPreDownloadUrl :: Book () -> Aff String
getPreDownloadUrl book = toAffE $ _getPreDownloadUrl $ _.md5 <<< unwrap $ book
