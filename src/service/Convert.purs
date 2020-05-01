module Service.Convert
  ( Convert(..)
  , convertInterpreter
  , loggingInterpreter
  , testConvertInterpreter
  ) where

import Control.Monad.Error.Class (class MonadError, catchError, throwError)
import Data.Book (Book(..), Extension(..), showFilename)
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
  Epub -> do
    FS.writeFile epubFilename downloaded
    kindlegenBuffer <- catchKindlegen $ C.execFileSync "./bin/kindlegen" [ epubFilename ] C.defaultExecSyncOptions
    kindlegenOutput <- liftEffect $ B.toString UTF8 kindlegenBuffer
    log $ "kindlegen output: " <> show kindlegenOutput
    ls <- FS.readdir tempDir
    log $ "ls: " <> show ls
    converted <- FS.readFile mobiFilename
    FS.unlink epubFilename
    FS.unlink mobiFilename
    pure $ Book
      $ mobiBook
          { downloaded = converted
          }
    where
    tempDir = "/tmp/"

    epubFilename = tempDir <> showFilename book'

    mobiBook = book { extension = Mobi }

    mobiFilename = tempDir <> (showFilename $ Book mobiBook)

    catchKindlegen = liftEffect <<< catchException (\e -> B.fromString ("kindlegen may have failed: " <> show e) UTF8)
  _ -> throwError $ error "not mobi or epub"
