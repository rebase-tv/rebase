import { AstroSite, StackContext, StaticSite, use } from "sst/constructs"
import { Auth } from "./auth"
import { DNS } from "./dns"
import { Dynamo } from "./dynamo"
import { Api } from "./api"

export function Site({ stack }: StackContext) {
  const auth = use(Auth)
  const dynamo = use(Dynamo)
  const dns = use(DNS)
  const api = use(Api)

  const astro = new AstroSite(stack, "site", {
    bind: [auth, dynamo, api],
    path: "packages/astro",
    customDomain: {
      hostedZone: dns.zone,
      domainName: dns.domain,
    },
  })

  const producer = new StaticSite(stack, "producer", {
    path: "packages/producer",
    environment: {
      VITE_AUTH_URL: auth.url,
      VITE_API_URL: api.url,
      VITE_STAGE: stack.stage,
    },
  })
}
