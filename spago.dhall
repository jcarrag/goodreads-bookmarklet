{-
Welcome to a Spago project!
You can edit this file as you like.
-}
{ name = "goodreads-bookmarklet"
, dependencies =
  [ "aff"
  , "aff-promise"
  , "console"
  , "debug"
  , "dotenv"
  , "effect"
  , "foreign-generic"
  , "functions"
  , "milkis"
  , "newtype"
  , "node-buffer"
  , "node-child-process"
  , "node-fs-aff"
  , "nullable"
  , "numbers"
  , "partial"
  , "psci-support"
  , "simple-json"
  , "web-dom-parser"
  ]
, packages = ./packages.dhall
, sources = [ "src/**/*.purs", "lib/**/*.purs" ]
}
