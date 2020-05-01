module Data.Book where

import Data.Maybe (fromJust)
import Data.Generic.Rep (class Generic)
import Data.Generic.Rep.Show (genericShow)
import Data.Newtype (class Newtype)
import Data.Number (fromString)
import Data.String (toLower, trim)
import Data.String.Regex (replace)
import Data.String.Regex.Flags (global)
import Data.String.Regex.Unsafe (unsafeRegex)
import Foreign (F, Foreign)
import Foreign.Generic (class Decode, decode)
import Partial.Unsafe (unsafePartial)
import Prelude (class Eq, class Ord, class Show, bind, pure, show, ($), (<<<), (<>))
import Simple.JSON as JSON

data Extension
  = Epub
  | Mobi
  | Other

instance decodeExtensionIns :: Decode Extension where
  decode extensionF = do
    (extension :: String) <- decode extensionF
    pure $ decode' extension
    where
    decode' "epub" = Epub

    decode' "mobi" = Mobi

    decode' _ = Other

derive instance genericExtension :: Generic Extension _

derive instance eqExtension :: Eq Extension

instance showExtension :: Show Extension where
  show = toLower <<< genericShow

derive instance ordExtension :: Ord Extension

newtype Book r
  = Book
  { author :: String
  , extension :: Extension
  , md5 :: String
  , filesize :: Number
  , title :: String
  | r
  }

derive instance genericBook :: Generic (Book r) _

decodeBook :: Foreign -> F (Book ())
decodeBook bookF = do
  bookRec <- JSON.readImpl bookF
  extension <- decode bookRec.extension
  pure $ Book
    $ bookRec
        { extension = extension
        , filesize = unsafePartial $ fromJust $ fromString bookRec.filesize
        , title = sanitisedTitle bookRec.title
        }

instance showBook :: Show (Book r) where
  show = genericShow <<< toBookShow

toBookShow :: forall r. Book r -> Book ()
toBookShow (Book book) =
  Book
    { author: book.author
    , extension: book.extension
    , md5: book.md5
    , filesize: book.filesize
    , title: book.title
    }

showFilename :: forall r. Book r -> String
showFilename (Book { title, extension }) = sanitisedTitle title <> "." <> show extension

sanitisedTitle :: String -> String
sanitisedTitle title = replace (unsafeRegex """\W""" global) "" $ trim title

derive instance newtypeBook :: Newtype (Book r) _
