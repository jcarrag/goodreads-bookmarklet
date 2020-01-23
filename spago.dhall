{-
Welcome to a Spago project!
You can edit this file as you like.
-}
{ name = "goodreads-bookmarklet"
, dependencies =
    [ "aff"
    , "aff-promise"
    , "affjax"
    , "console"
    , "dotenv"
    , "effect"
    , "foreign-generic"
    , "functions"
    , "milkis"
    , "newtype"
    , "node-buffer"
    , "partial"
    , "psci-support"
    , "web-dom-parser"
    ]
, packages = ./packages.dhall
, sources = [ "src/**/*.purs", "lib/**/*.purs" ]
}
