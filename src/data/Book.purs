module Data.Book where

import Prelude
import Data.Generic.Rep (class Generic)
import Data.Generic.Rep.Show (genericShow)
import Data.Newtype (class Newtype)

newtype Book r
  = Book
  { author :: String
  , extension :: String
  , md5 :: String
  , filesize :: Number
  , title :: String
  | r
  }

derive instance genericBook :: Generic (Book r) _

instance showBook :: Show (Book r) where
  show = genericShow <<< toBookShow

toBookShow :: forall r. Book r -> Book ()
toBookShow (Book book) =
  Book
    { author: book.author
    , extension: book.extension
    , md5: book.md5
    , filesize: book.filesize
    , title: book.title
    }

derive instance newtypeBook :: Newtype (Book r) _
