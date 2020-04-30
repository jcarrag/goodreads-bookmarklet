module Service.Download
  ( Download(..)
  , downloadInterpreter
  , loggingInterpreter
  , testDownloadInterpreter
  ) where

import Control.Alternative ((<|>))
import Control.Monad.Error.Class (class MonadError, catchError, throwError)
import Data.Array as A
import Data.Array.Partial (head, tail)
import Data.Book (Book(..))
import Data.Either (fromRight)
import Data.Maybe (fromJust)
import Data.String.Regex (replace)
import Data.String.Regex.Flags (global)
import Data.String.Regex.Unsafe (unsafeRegex)
import Data.Tuple (Tuple(..))
import Effect (Effect)
import Effect.Aff (Aff)
import Effect.Class (class MonadEffect, liftEffect)
import Effect.Class.Console (log)
import Effect.Exception (Error)
import Libgen as L
import Milkis as M
import Milkis.Impl.Node (nodeFetch)
import Node.Buffer as B
import Node.FS.Aff as FS
import Partial.Unsafe (unsafePartial)
import Prelude (bind, discard, negate, pure, show, ($), (<$>), (<>), (*>))
import Record as R
import Web.DOM.DOMParser (parseHTMLFromString)
import Web.DOM.DOMParser.Node (makeDOMParser)
import Web.DOM.Document (Document, toNode)
import Web.DOM.Element (fromNode, getAttribute)
import Web.DOM.Node (firstChild, nextSibling, textContent)

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
        , extension: filename
        , md5: "md5"
        , filesize: 0.0
        , title: filename
        , downloaded: file
        }

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
    downloadableBooks = A.sortWith (\(Book b) -> Tuple b.extension $ negate b.filesize) $ A.filter (\(Book b) -> A.elem b.extension [ "mobi", "epub" ]) books

    downloadableBooksE = downloadBinary <$> downloadableBooks
  log $ "sorted books: " <> show downloadableBooks
  A.foldr (<|>) (unsafePartial $ head downloadableBooksE) (unsafePartial $ tail downloadableBooksE)

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

-- XPATH: "/body/table/tbody/tr[1]/td[2]/a/@href"
documentToFileDownloadUrl :: Document -> Effect String
documentToFileDownloadUrl document = do
  let
    node = toNode document
  body1 <- firstChild' node
  body <- nextSibling' body1
  text <- textContent body
  table1 <- firstChild' body
  table <- nextSibling' table1
  tbody2 <- firstChild' table
  tbody1 <- nextSibling' tbody2
  tbody <- nextSibling' tbody1
  tr <- firstChild' tbody
  td1 <- firstChild' tr
  td <- nextSibling' td1
  a <- firstChild' td
  let
    aE = unsafePartial $ fromJust $ fromNode a
  unsafePartial $ fromJust <$> getAttribute "href" aE
  where
  firstChild' node = unsafePartial $ fromJust <$> firstChild node

  nextSibling' node = unsafePartial $ fromJust <$> nextSibling node
