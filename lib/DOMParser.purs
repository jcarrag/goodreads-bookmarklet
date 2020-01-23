module Web.DOM.DOMParser.Node where

import Effect (Effect)
import Web.DOM.DOMParser (DOMParser)

foreign import makeDOMParser ∷ Effect DOMParser
