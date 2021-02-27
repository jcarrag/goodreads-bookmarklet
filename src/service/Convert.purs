module Service.Convert
  ( Convert(..)
  , convertInterpreter
  , loggingInterpreter
  , testConvertInterpreter
  ) where

import Control.Monad.Error.Class (class MonadError, catchError, throwError)
import Data.Book (Book(..), Extension(..), showFilename)
import Effect.Aff (Aff, error)
import Effect.Class (class MonadEffect)
import Effect.Class.Console (log)
import Effect.Exception (Error)
import Node.Buffer as B
import Prelude (bind, discard, pure, show, ($), (*>), (<>))

newtype Convert f
  = Convert
  { convert :: Book ( downloaded :: B.Buffer ) -> f (Book ( downloaded :: B.Buffer ))
  }

convertInterpreter :: Convert Aff
convertInterpreter =
  Convert
    { convert: convertBook
    }

testConvertInterpreter :: Convert Aff
testConvertInterpreter =
  Convert
    { convert: pure
    }

loggingInterpreter :: forall f. MonadError Error f => MonadEffect f => Convert f -> Convert f
loggingInterpreter (Convert underlying) =
  Convert
    underlying
      { convert =
        \book -> do
          log $ "Converting book (input:'" <> showFilename book <> "')"
          result <- underlying.convert book `logError` "Failed to convert book"
          log $ "Successfully converted book (output:'" <> showFilename result <> "')"
          pure result
      }
  where
  logError fa msg = fa `catchError` (\e -> (log $ msg <> ": " <> show e) *> throwError e)

convertBook :: Book ( downloaded :: B.Buffer ) -> Aff (Book ( downloaded :: B.Buffer ))
convertBook book'@(Book book@{ downloaded, extension, title }) = case extension of
  Mobi -> pure book'
  Epub ->
    pure $ Book
      $ book
          { extension = Png
          }
  _ -> throwError $ error "not mobi or epub"
