module Export (handler) where

import Prelude

import App as A
import AwsEvent (AwsEvent)
import Effect.Aff.Compat (mkEffectFn1)
import Effect.Uncurried (EffectFn1)

handler :: EffectFn1 AwsEvent Unit
handler = mkEffectFn1 A.handleEvent
