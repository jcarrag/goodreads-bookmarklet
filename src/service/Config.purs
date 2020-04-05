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
import Prelude (bind, pure, ($))

newtype Config f
  = Config
  { mailjetUser :: f String
  }

configInterpreter :: Config Aff
configInterpreter =
  Config
    { mailjetUser: getMailjetUser
    }

getMailjetUser :: Aff String
getMailjetUser = do
  _ <- loadFile
  userM <- liftEffect $ lookupEnv "MAILJET_USER"
  pure $ unsafePartial $ fromJust userM
