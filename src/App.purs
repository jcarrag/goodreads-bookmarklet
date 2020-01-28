module App (handleEvent) where

import Prelude (Unit, bind, discard, pure, show, ($), (<$>), (<>), (>>=), (<<<))

import AwsEvent (AwsEvent(..))
import Control.Alternative ((<|>))
import Control.Monad.Error.Class (throwError)
import Data.Array as A
import Data.Array.Partial (head, tail)
import Data.Either (fromRight)
import Data.Maybe (Maybe(..), fromJust, fromMaybe)
import Data.Newtype (over)
import Data.String (trim)
import Data.String.Regex (replace)
import Data.String.Regex.Flags (global)
import Data.String.Regex.Unsafe (unsafeRegex)
import Data.Tuple (Tuple(..))
import Dotenv (loadFile)
import Effect (Effect)
import Effect.Aff (Aff, attempt, error, launchAff_)
import Effect.Class (liftEffect)
import Effect.Console (log)
import Effect.Exception (catchException)
import Libgen as L
import Milkis as M
import Milkis.Impl.Node (nodeFetch)
import Node.Buffer as B
import Node.ChildProcess as C
import Node.Encoding (Encoding(UTF8))
import Node.Encoding as E
import Node.FS.Aff as FS
import Node.Process (lookupEnv)
import Partial.Unsafe (unsafePartial)
import Record as R
import Web.DOM.DOMParser (parseHTMLFromString)
import Web.DOM.DOMParser.Node (makeDOMParser)
import Web.DOM.Document (Document, toNode)
import Web.DOM.Element (fromNode, getAttribute)
import Web.DOM.Node (firstChild, nextSibling, textContent)

handleEvent :: AwsEvent -> Effect Unit
handleEvent (AwsEvent { queryStringParameters: { query, from, to }}) =
  launchAff_ do
    mailjetUser <- getMailjetUser
    mirror <- L.getMirror
    liftEffect $ log $ "mirror: " <> mirror
    books <- L.search mirror query
    liftEffect $ log $ "books: " <> show books
    let
      downloadableBooks = A.sortWith (\(L.Book b) -> Tuple b.extension b.filesize) $ A.filter (\(L.Book b) -> A.elem b.extension ["mobi", "epub"]) books
      downloadableBooksE = downloadBook' <$> downloadableBooks
    liftEffect $ log $ "sorted books: " <> show downloadableBooks
    (L.Book book) <- A.foldr (<|>) (unsafePartial $ head downloadableBooksE) (unsafePartial $ tail downloadableBooksE)
    emailStatusCode <- sendEmail mailjetUser query $ fromMaybe book.downloaded book.converted
    liftEffect $ log $ "email status code: " <> emailStatusCode
  where
    downloadBook' :: L.Book () -> Aff (L.Book (downloaded :: B.Buffer, converted :: Maybe B.Buffer ))
    downloadBook' book@(L.Book { extension }) =
      do
        liftEffect $ log $ "downloading book: " <> show book
        case extension of
          "epub" -> downloadBook book >>= convertFile
          "mobi" -> (over L.Book (R.merge { converted: Nothing })) <$> downloadBook book
          _ -> throwError $ error "not mobi or epub"

downloadBook :: L.Book () -> Aff (L.Book ( downloaded :: B.Buffer ))
downloadBook book@(L.Book b) =
  do
    preDownloadUrl <- L.getPreDownloadUrl book
    liftEffect $ log $ "pre-download url: " <> preDownloadUrl
    downloadFileUrl <- getDownloadFileUrl preDownloadUrl
    liftEffect $ log $ "download file url: " <> downloadFileUrl
    downloaded <- downloadFile downloadFileUrl
    liftEffect $ log "file downloaded"
    pure $ L.Book $ R.merge b { downloaded }


convertFile :: L.Book ( downloaded :: B.Buffer ) -> Aff (L.Book ( downloaded :: B.Buffer, converted :: Maybe B.Buffer ))
convertFile (L.Book book@{ downloaded, extension, title }) =
  do
     liftEffect $ log "writing downloaded file"
     FS.writeFile fileName downloaded
     liftEffect $ log $ "converting downloaded file: " <> fileName
     _ <- catchKindlegen $ C.execSync ("./bin/kindlegen \""<>fileName<>"\"") C.defaultExecSyncOptions
     liftEffect $ log $ "reading converted file: " <> mobiFileName
     converted <- FS.readFile mobiFileName
     liftEffect $ log $ "deleting downloaded file" <> fileName
     FS.unlink fileName
     liftEffect $ log $ "deleting converted file: " <> mobiFileName
     FS.unlink mobiFileName
     pure $ L.Book $ R.merge book { converted: Just converted }
  where
    sanitizedTitle = trim title
    fileName = sanitizedTitle <> "." <> extension
    mobiFileName = sanitizedTitle <> ".mobi"
    catchKindlegen = liftEffect <<< catchException (\_ -> B.fromString "kindlegen may have failed" UTF8)

getMailjetUser :: Aff String
getMailjetUser =
  do
    _ <- loadFile
    userM <- liftEffect $ lookupEnv "MAILJET_USER"
    pure $ unsafePartial $ fromJust userM

sendEmail :: String -> String -> B.Buffer -> Aff String
sendEmail mailjetUser fileName file = 
  do
    fileB64 <- liftEffect $ B.toString E.Base64 file
    emailResponse <- attempt $ fetch url $ opts fileB64
    pure $ show $ M.statusCode $ unsafePartial $ fromRight emailResponse
  where
    fileName' = fileName <> ".mobi"
    fetch = M.fetch nodeFetch
    url = M.URL $ "https://" <> mailjetUser <> "@api.mailjet.com/v3.1/send"
    opts fileB64 =
      { method: M.postMethod
      , headers: M.makeHeaders { "Content-Type": "application/json" }
      , body:
          """
      {
        "Messages": [
          {
            "From": { "Email": "test@email.com" },
            "To": [{ "Email": "test@kindle.com" }],
            "TextPart": "Greetings from Mailjet.",
            "Attachments": [
              {
                "Filename": """<>"\""<>fileName'<>"\""<>""",
                "ContentType": "text/plain",
                "Base64Content": """<>"\""<>fileB64<>"\""<>"""
              }
            ]
          }
        ]
      }
          """
      }

getDownloadFileUrl :: String -> Aff String
getDownloadFileUrl preDownloadUrl = unsafePartial $
  do
    preDownloadPageResponse <- fetch (M.URL preDownloadUrl) M.defaultFetchOptions
    preDownloadPageXml <- M.text preDownloadPageResponse
    let preDownloadPageXml' = replace (unsafeRegex "\t|\r|\n" global) "" preDownloadPageXml
    domParser <- liftEffect makeDOMParser
    document <- liftEffect $ fromRight <$> parseHTMLFromString preDownloadPageXml' domParser
    liftEffect $ documentToFileDownloadUrl document
  where
    fetch = M.fetch nodeFetch

downloadFile :: String -> Aff B.Buffer
downloadFile downloadFileUrl =
  do
    fileResponse <- fetch (M.URL downloadFileUrl) M.defaultFetchOptions
    arrayBuffer <- M.arrayBuffer fileResponse
    liftEffect $ B.fromArrayBuffer arrayBuffer
  where
    fetch = M.fetch nodeFetch

-- XPATH: "/body/table/tbody/tr[1]/td[2]/a/@href"
documentToFileDownloadUrl :: Document -> Effect String
documentToFileDownloadUrl document =
   do
     let node = toNode document
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
     let aE = unsafePartial $ fromJust $ fromNode a
     unsafePartial $ fromJust <$> getAttribute "href" aE
   where
     firstChild' node = unsafePartial $ fromJust <$> firstChild node
     nextSibling' node = unsafePartial $ fromJust <$> nextSibling node
