module Main where

import Prelude

import App as A
import Effect (Effect)


main :: Effect Unit
main = A.handleEvent
