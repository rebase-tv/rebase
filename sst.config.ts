import { SSTConfig } from "sst";
import { Api, EventBus, Table } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "rebase",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Default({ stack }) {
      const table = new Table(stack, "table", {
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

      stack.addOutputs({
        ApiEndpoint: api.url,
      });
    });
  },
} satisfies SSTConfig;
