import { SSTConfig } from "sst";
import { AstroSite, Api, EventBus, Table, Auth } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "rebase",
      region: "us-east-1",
      profile: "ironbay-dev",
    };
  },
  stacks(app) {
    app.stack(function Default({ stack }) {
      const table = new Table(stack, "data", {
        fields: {
          pk: "string",
          sk: "string",
          gsi1pk: "string",
          gsi1sk: "string",
          gsi2pk: "string",
          gsi2sk: "string",
        },
        primaryIndex: {
          partitionKey: "pk",
          sortKey: "sk",
        },
        globalIndexes: {
          gsi1: {
            partitionKey: "gsi1pk",
            sortKey: "gsi1sk",
          },
          gsi2: {
            partitionKey: "gsi2pk",
            sortKey: "gsi2sk",
          },
        },
      });

      const auth = new Auth(stack, "auth", {
        authenticator: {
          handler: "packages/functions/src/auth.handler",
          bind: [table],
        },
      });

      const bus = new EventBus(stack, "bus");

      const api = new Api(stack, "api", {
        defaults: {
          function: {
            bind: [bus, table],
          },
        },
        routes: {
          "GET /": "packages/functions/src/lambda.handler",
        },
      });

      const site = new AstroSite(stack, "site", {
        bind: [auth],
        path: "packages/astro",
      });

      stack.addOutputs({
        ApiEndpoint: api.url,
        AuthEndpoint: auth.url || "",
      });
    });
  },
} satisfies SSTConfig;
