module App where

import Prelude

import Data.Array.Partial (head)
import Data.ArrayBuffer.Types (ArrayBuffer)
import Data.Either (fromRight)
import Data.Maybe (fromJust)
import Data.String.Regex (replace)
import Data.String.Regex.Flags (global)
import Data.String.Regex.Unsafe (unsafeRegex)
import Dotenv (loadFile)
import Effect (Effect)
import Effect.Aff (Aff, launchAff_, attempt)
import Effect.Class (liftEffect)
import Effect.Console (log)
import Libgen as L
import Milkis as M
import Milkis.Impl.Node (nodeFetch)
import Node.Buffer as B
import Node.Encoding as E
import Node.Process (lookupEnv)
import Partial.Unsafe (unsafePartial)
import Web.DOM.DOMParser (parseHTMLFromString)
import Web.DOM.DOMParser.Node (makeDOMParser)
import Web.DOM.Document (Document, toNode)
import Web.DOM.Element (fromNode, getAttribute)
import Web.DOM.Node (firstChild, nextSibling, textContent)


handleEvent :: Effect Unit
handleEvent =
  launchAff_ do
   mailjetUser <- getMailjetUser
   mirror <- L.getMirror
   liftEffect $ log $ "mirror: " <> mirror
   let query = "grapes of wrath"
   books <- L.search mirror query
   liftEffect $ log $ "books: " <> show books
   preDownloadUrl <- L.getPreDownloadUrl $ unsafePartial $ head books
   liftEffect $ log $ "pre-download url: " <> preDownloadUrl
   downloadFileUrl <- getDownloadFileUrl preDownloadUrl
   liftEffect $ log $ "download file url: " <> downloadFileUrl
   file <- downloadFile downloadFileUrl
   liftEffect $ log "file downloaded"
   emailStatusCode <- sendEmail mailjetUser query file
   liftEffect $ log $ "email status code: " <> emailStatusCode

getMailjetUser :: Aff String
getMailjetUser =
  do
    _ <- loadFile
    userM <- liftEffect $ lookupEnv "MAILJET_USER"
    pure $ unsafePartial $ fromJust userM

sendEmail :: String -> String -> ArrayBuffer -> Aff String
sendEmail mailjetUser fileName file = 
  do
    fileB64 <- liftEffect $ (B.fromArrayBuffer file :: Effect B.Buffer) >>= (B.toString E.Base64)
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
    preDownloadPageResponse <- attempt $ fetch (M.URL preDownloadUrl) M.defaultFetchOptions
    preDownloadPageXml <- M.text $ fromRight preDownloadPageResponse
    let preDownloadPageXml' = replace (unsafeRegex "\t|\r|\n" global) "" preDownloadPageXml
    domParser <- liftEffect makeDOMParser
    document <- liftEffect $ fromRight <$> parseHTMLFromString preDownloadPageXml' domParser
    liftEffect $ documentToFileDownloadUrl document
  where
    fetch = M.fetch nodeFetch

downloadFile :: String -> Aff ArrayBuffer
downloadFile downloadFileUrl =
  do
    fileResponse <- attempt $ fetch (M.URL downloadFileUrl) M.defaultFetchOptions
    M.arrayBuffer $ unsafePartial $ fromRight fileResponse
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
