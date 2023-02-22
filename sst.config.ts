import { SSTConfig } from "sst";
import { DNS } from "./stacks/dns";
import { Dynamo } from "./stacks/dynamo";
import { Auth } from "./stacks/auth";
import { Site } from "./stacks/site";

export default {
  config(_input) {
    return {
      name: "rebase",
      region: "us-east-1",
      profile: "rebase-prod",
    };
  },
  stacks(app) {
    app.stack(DNS).stack(Dynamo).stack(Auth).stack(Site);
  },
} satisfies SSTConfig;
