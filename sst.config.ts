import { SSTConfig } from "sst"
import { DNS } from "./stacks/dns"
import { Dynamo } from "./stacks/dynamo"
import { Auth } from "./stacks/auth"
import { Site } from "./stacks/site"
import { Api } from "./stacks/api"
import { Stream } from "./stacks/stream"
import { App } from "./stacks/app"

export default {
  config(_input) {
    return {
      name: "rebase",
      region: "us-east-1",
      profile: "rebase-prod",
    }
  },
  stacks(app) {
    app
      .stack(DNS)
      .stack(Stream)
      .stack(Dynamo)
      .stack(Auth)
      .stack(Api)
      .stack(Site)
      .stack(App)
  },
} satisfies SSTConfig
