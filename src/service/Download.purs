module Service.Download
  ( Download(..)
  , downloadInterpreter
  , loggingInterpreter
  , testDownloadInterpreter
  ) where

import Control.Alternative ((<|>))
import Control.Monad.Error.Class (class MonadError, catchError, throwError)
import Control.Monad.Except (runExcept)
import Data.Array as A
import Data.Book (Book(..), Extension(..))
import Data.Either (either, fromRight)
import Data.Maybe (fromJust)
import Data.String.Regex (replace)
import Data.String.Regex.Flags (global)
import Data.String.Regex.Unsafe (unsafeRegex)
import Data.Tuple (Tuple(..))
import Effect (Effect)
import Effect.Aff (Aff)
import Effect.Class (class MonadEffect, liftEffect)
import Effect.Class.Console (log)
import Effect.Exception (Error, error)
import Foreign.Generic (encode, decode)
import Libgen as L
import Milkis as M
import Milkis.Impl.Node (nodeFetch)
import Node.Buffer as B
import Node.FS.Aff as FS
import Partial.Unsafe (unsafePartial)
import Prelude (bind, discard, identity, negate, pure, show, ($), (<$>), (<>), (*>))
import Record as R
import Web.DOM.DOMParser (parseHTMLFromString)
import Web.DOM.DOMParser.Node (makeDOMParser)
import Web.DOM.Document (Document, toNode)
import Web.DOM.Element (fromNode, getAttribute)
import Web.DOM.Node (firstChild, nextSibling)

newtype Download f
  = Download
  { download :: String -> f (Book ( downloaded :: B.Buffer ))
  }

downloadInterpreter :: Download Aff
downloadInterpreter =
  Download
    { download: downloadBook
    }

testDownloadInterpreter :: Download Aff
testDownloadInterpreter =
  Download
    { download: readBookFromFile
    }
  where
  readBookFromFile :: String -> Aff (Book ( downloaded :: B.Buffer ))
  readBookFromFile filename = do
    file <- FS.readFile $ "bin/" <> filename
    pure $ Book
      $ { author: "author"
        , extension: extension
        , md5: "md5"
        , filesize: 0.0
        , title: filename
        , downloaded: file
        }
    where
    extension = either (\_ -> Other) identity $ runExcept $ decode $ encode filename

loggingInterpreter :: forall f. MonadError Error f => MonadEffect f => Download f -> Download f
loggingInterpreter (Download underlying) =
  Download
    underlying
      { download =
        \query -> do
          log $ "Downloading book (query: '" <> query <> "')"
          result <- underlying.download query `logError` "Failed to download book"
          log "Successfully downloaded book"
          pure result
      }
  where
  logError fa msg = fa `catchError` (\e -> (log $ msg <> ": " <> show e) *> throwError e)

downloadBook :: String -> Aff (Book ( downloaded :: B.Buffer ))
downloadBook query = do
  mirror <- L.getMirror
  log $ "mirror: " <> mirror
  books <- L.search mirror query
  log $ "books: " <> show books
  let
    downloadableBooks = A.sortWith (\(Book b) -> Tuple b.extension $ negate b.filesize) $ A.filter (\(Book b) -> A.elem b.extension [ Mobi, Epub ]) books
    downloadableBooksE = downloadBinary <$> downloadableBooks
  log $ "sorted books: " <> show downloadableBooks
  A.foldr (<|>) (throwError $ error "could not download book") downloadableBooksE

downloadBinary :: Book () -> Aff (Book ( downloaded :: B.Buffer ))
downloadBinary book@(Book b) = do
  preDownloadUrl <- L.getPreDownloadUrl book
  log $ "pre-download url: " <> preDownloadUrl
  downloadFileUrl <- getDownloadUrl preDownloadUrl
  log $ "download file url: " <> downloadFileUrl
  downloaded <- downloadFile downloadFileUrl
  log "file downloaded"
  pure $ Book $ R.merge b { downloaded }

downloadFile :: String -> Aff B.Buffer
downloadFile downloadFileUrl = do
  fileResponse <- fetch (M.URL downloadFileUrl) M.defaultFetchOptions
  arrayBuffer <- M.arrayBuffer fileResponse
  liftEffect $ B.fromArrayBuffer arrayBuffer
  where
  fetch = M.fetch nodeFetch

getDownloadUrl :: String -> Aff String
getDownloadUrl preDownloadUrl =
  unsafePartial
    $ do
        preDownloadPageResponse <- fetch (M.URL preDownloadUrl) M.defaultFetchOptions
        preDownloadPageXml <- M.text preDownloadPageResponse
        let
          preDownloadPageXml' = replace (unsafeRegex "\t|\r|\n" global) "" preDownloadPageXml
        domParser <- liftEffect makeDOMParser
        document <- liftEffect $ fromRight <$> parseHTMLFromString preDownloadPageXml' domParser
        liftEffect $ documentToFileDownloadUrl document
  where
  fetch = M.fetch nodeFetch

-- XPATH: "/html/body/table/tbody/tr/td[2]/div[1]/h2/a"
documentToFileDownloadUrl :: Document -> Effect String
documentToFileDownloadUrl document = do
  let
    node = toNode document
  hTML <- firstChild' node
  html <- nextSibling' hTML
  head <- firstChild' html
  body <- nextSibling' head
  table <- firstChild' body
  tr <- firstChild' table
  td1 <- firstChild' tr
  td2 <- nextSibling' td1
  div <- firstChild' td2
  h2 <- firstChild' div
  a <- firstChild' h2
  let
    aE = unsafePartial $ fromJust $ fromNode a
  unsafePartial $ fromJust <$> getAttribute "href" aE
  where
  firstChild' node = unsafePartial $ fromJust <$> firstChild node

  nextSibling' node = unsafePartial $ fromJust <$> nextSibling node
