import { AstroSite, StackContext, use } from "sst/constructs"
import { Auth } from "./auth"
import { DNS } from "./dns"
import { Dynamo } from "./dynamo"
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins"
import { Api } from "./api"

export function Site({ stack }: StackContext) {
  const auth = use(Auth)
  const dynamo = use(Dynamo)
  const dns = use(DNS)
  const api = use(Api)

  const site = new AstroSite(stack, "site", {
    bind: [auth, dynamo, api],
    path: "packages/astro",
    customDomain: {
      hostedZone: dns.zone,
      domainName: dns.domain,
    },
  })
}
