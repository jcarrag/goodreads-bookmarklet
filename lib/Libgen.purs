module Libgen where

import Prelude
import Control.Promise (Promise, toAffE)
import Data.Book (Book)
import Data.Newtype (unwrap)
import Effect (Effect)
import Effect.Aff (Aff)

foreign import _getMirror :: Effect (Promise String)

foreign import _search :: forall r. String -> String -> Effect (Promise (Array (Book r)))

foreign import _getPreDownloadUrl :: String -> Effect (Promise (String))

getMirror :: Aff String
getMirror = toAffE _getMirror

search :: String -> String -> Aff (Array (Book ()))
search mirror query = toAffE $ _search mirror query

getPreDownloadUrl :: Book () -> Aff String
getPreDownloadUrl book = toAffE $ _getPreDownloadUrl $ _.md5 <<< unwrap $ book
