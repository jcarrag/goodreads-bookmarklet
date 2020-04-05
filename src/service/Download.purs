module Service.Download
  ( Download(..)
  , downloadInterpreter
  ) where

import Prelude (bind, discard, negate, pure, show, ($), (<$>), (<>), (>>=), (<<<))
import Control.Alternative ((<|>))
import Control.Monad.Error.Class (throwError)
import Data.Array as A
import Data.Array.Partial (head, tail)
import Data.Book (Book(..))
import Data.Either (fromRight)
import Data.Maybe (Maybe(..), fromJust)
import Data.Newtype (over)
import Data.String (trim)
import Data.String.Regex (replace)
import Data.String.Regex.Flags (global)
import Data.String.Regex.Unsafe (unsafeRegex)
import Data.Tuple (Tuple(..))
import Effect (Effect)
import Effect.Aff (Aff, error)
import Effect.Class (liftEffect)
import Effect.Class.Console (log)
import Effect.Exception (catchException)
import Libgen as L
import Milkis as M
import Milkis.Impl.Node (nodeFetch)
import Node.Buffer as B
import Node.ChildProcess as C
import Node.Encoding (Encoding(UTF8))
import Node.FS.Aff as FS
import Partial.Unsafe (unsafePartial)
import Record as R
import Web.DOM.DOMParser (parseHTMLFromString)
import Web.DOM.DOMParser.Node (makeDOMParser)
import Web.DOM.Document (Document, toNode)
import Web.DOM.Element (fromNode, getAttribute)
import Web.DOM.Node (firstChild, nextSibling, textContent)

newtype Download f
  = Download
  { download :: String -> f (Book ( downloaded :: B.Buffer, converted :: Maybe B.Buffer ))
  }

downloadInterpreter :: Download Aff
downloadInterpreter =
  Download
    { download: downloadBook
    }

downloadBook :: String -> Aff (Book ( downloaded :: B.Buffer, converted :: Maybe B.Buffer ))
downloadBook query = do
  mirror <- L.getMirror
  log $ "mirror: " <> mirror
  books <- L.search mirror query
  log $ "books: " <> show books
  let
    downloadableBooks = A.sortWith (\(Book b) -> Tuple b.extension $ negate b.filesize) $ A.filter (\(Book b) -> A.elem b.extension [ "mobi", "epub" ]) books

    downloadableBooksE = handleEpubMobi <$> downloadableBooks
  log $ "sorted books: " <> show downloadableBooks
  A.foldr (<|>) (unsafePartial $ head downloadableBooksE) (unsafePartial $ tail downloadableBooksE)
  where
  handleEpubMobi book@(Book { extension }) = do
    log $ "downloading book: " <> show book
    case extension of
      "epub" -> downloadBinary book >>= convertBinary
      "mobi" -> (over Book (R.merge { converted: Nothing })) <$> downloadBinary book
      _ -> throwError $ error "not mobi or epub"

convertBinary :: Book ( downloaded :: B.Buffer ) -> Aff (Book ( downloaded :: B.Buffer, converted :: Maybe B.Buffer ))
convertBinary (Book book@{ downloaded, extension, title }) = do
  FS.writeFile fileName downloaded
  _ <- catchKindlegen $ C.execSync ("./bin/kindlegen \"" <> fileName <> "\"") C.defaultExecSyncOptions
  converted <- FS.readFile mobiFileName
  FS.unlink fileName
  FS.unlink mobiFileName
  pure $ Book $ R.merge book { converted: Just converted }
  where
  sanitizedTitle = trim title

  fileName = sanitizedTitle <> "." <> extension

  mobiFileName = sanitizedTitle <> ".mobi"

  catchKindlegen = liftEffect <<< catchException (\_ -> B.fromString "kindlegen may have failed" UTF8)

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
