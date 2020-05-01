module Service.Config
  ( Config(..)
  , configInterpreter
  ) where

import Data.Maybe (fromJust)
import Dotenv (loadFile)
import Effect.Aff (Aff)
import Effect.Class (liftEffect)
import Node.Process (lookupEnv)
import Partial.Unsafe (unsafePartial)
import Prelude (bind, pure, ($), (<$>))

newtype Config
  = Config
  { mailjetUser :: String
  }

configInterpreter :: Aff Config
configInterpreter =
  unsafePartial
    $ do
        _ <- loadFile
        mailjetUser <- getValue "MAILJET_USER"
        pure $ Config
          $ { mailjetUser
            }
  where
  getValue :: String -> Aff String
  getValue name = unsafePartial $ fromJust <$> (liftEffect $ lookupEnv name)
