import { StackContext, Api as SSTApi, use } from "sst/constructs"
import { DNS } from "./dns"

export function Api({ stack }: StackContext) {
  const dns = use(DNS)

  const api = new SSTApi(stack, "api", {
    routes: {
      "GET /media/card": {
        function: {
          handler: "packages/functions/src/media/card.handler",
          nodejs: {
            // This skips bundling for this dependency and instead just installs it normally
            // Probably needed for the binary dependency
            install: ["chrome-aws-lambda"],
          },
          copyFiles: [],
        },
      },
    },
    customDomain: {
      domainName: "api." + dns.domain,
      hostedZone: dns.zone,
    },
  })

  return api
}
