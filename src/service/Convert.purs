module Service.Convert
  ( Convert(..)
  , convertInterpreter
  , loggingInterpreter
  , testConvertInterpreter
  ) where

import Control.Monad.Error.Class (class MonadError, catchError, throwError)
import Data.Book (Book(..))
import Data.String (trim)
import Effect.Aff (Aff, error)
import Effect.Class (class MonadEffect, liftEffect)
import Effect.Class.Console (log)
import Effect.Exception (Error, catchException)
import Node.Buffer as B
import Node.ChildProcess as C
import Node.Encoding (Encoding(UTF8))
import Node.FS.Aff as FS
import Prelude (bind, discard, pure, show, ($), (*>), (<<<), (<>))

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
          _ <- log "Converting book"
          result <- underlying.convert book `logError` "Failed to convert book"
          log "Successfully converted book"
          pure result
      }
  where
  logError fa msg = fa `catchError` (\e -> (log $ msg <> ": " <> show e) *> throwError e)

convertBook :: Book ( downloaded :: B.Buffer ) -> Aff (Book ( downloaded :: B.Buffer ))
convertBook book'@(Book book@{ downloaded, extension, title }) = case extension of
  "mobi" -> pure book'
  "epub" -> do
    FS.writeFile fileName downloaded
    _ <- catchKindlegen $ C.execSync ("./bin/kindlegen \"" <> fileName <> "\"") C.defaultExecSyncOptions
    converted <- FS.readFile mobiFileName
    FS.unlink fileName
    FS.unlink mobiFileName
    pure $ Book $ book { downloaded = converted }
    where
    sanitizedTitle = trim title

    fileName = sanitizedTitle <> "." <> extension

    mobiFileName = sanitizedTitle <> ".mobi"

    catchKindlegen = liftEffect <<< catchException (\_ -> B.fromString "kindlegen may have failed" UTF8)
  _ -> throwError $ error "not mobi or epub"
