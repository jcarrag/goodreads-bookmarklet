module App (handleEvent) where

import Prelude (Unit, bind)
import Data.AwsEvent (AwsEvent(..))
import Effect (Effect)
import Effect.Aff (launchAff_)
import Service.Download (downloadBook)
import Service.Email (sendEmail)

handleEvent :: AwsEvent -> Effect Unit
handleEvent (AwsEvent { queryStringParameters: { query, from, to } }) =
  launchAff_ do
    book <- downloadBook query
    sendEmail book from to
