module Libgen where

import Prelude
import Control.Monad.Except (runExcept)
import Control.Promise (Promise, toAffE)
import Data.Book (Book, decodeBook)
import Data.Either (either)
import Data.Newtype (unwrap)
import Data.Traversable (traverse)
import Effect (Effect)
import Effect.Aff (Aff)
import Effect.Class (liftEffect)
import Effect.Exception (throw)
import Foreign (Foreign)

foreign import _getMirror :: Effect (Promise String)

foreign import _search :: String -> String -> Effect (Promise (Array Foreign))

foreign import _getPreDownloadUrl :: String -> Effect (Promise (String))

getMirror :: Aff String
getMirror = toAffE _getMirror

search :: String -> String -> Aff (Array (Book ()))
search mirror query = do
  results <- toAffE $ _search mirror query
  books <- traverse decode' results
  pure books
  where
  decode' :: Foreign -> Aff (Book ())
  decode' res = liftEffect $ either (throw <<< show) pure $ runExcept $ decodeBook res

getPreDownloadUrl :: Book () -> Aff String
getPreDownloadUrl book = toAffE $ _getPreDownloadUrl $ _.md5 <<< unwrap $ book
