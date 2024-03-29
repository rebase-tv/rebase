import { SSTConfig } from "sst"
import { DNS } from "./stacks/dns"
import { Dynamo } from "./stacks/dynamo"
import { Auth } from "./stacks/auth"
import { Site } from "./stacks/site"
import { Api } from "./stacks/api"
import { Stream } from "./stacks/stream"
import { App } from "./stacks/app"
import { Realtime } from "./stacks/realtime"
import { Secrets } from "./stacks/secrets"

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
      .stack(Secrets)
      .stack(DNS)
      .stack(Stream)
      .stack(Dynamo)
      .stack(Auth)
      .stack(Api)
      .stack(Site)
      .stack(App)
      .stack(Realtime)
  },
} satisfies SSTConfig
