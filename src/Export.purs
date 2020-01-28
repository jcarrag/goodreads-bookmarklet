module Export (handler) where

import Prelude
import App as A
import Data.AwsEvent (AwsEvent)
import Data.Nullable (Nullable, null)
import Effect (Effect)
import Effect.Aff.Compat (mkEffectFn3, runEffectFn2)
import Effect.Uncurried (EffectFn2, EffectFn3)
import Foreign (Foreign, unsafeFromForeign)

handler :: EffectFn3 AwsEvent Foreign Foreign Unit
handler = mkEffectFn3 handleEvent

handleEvent :: AwsEvent -> Foreign -> Foreign -> Effect Unit
handleEvent event _ cbF = A.handleEvent event >>= \_ -> runEffectFn2 (toCallback cbF) null response
  where
  toCallback :: forall r. Foreign -> EffectFn2 (Nullable Unit) { | r } Unit
  toCallback = unsafeFromForeign

  response =
    { statusCode: 200
    , headers:
      { "Access-Control-Allow-Origin": "*"
      , "Access-Control-Allow-Credentials": true
      }
    }
