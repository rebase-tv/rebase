import { AstroSite, StackContext, use } from "sst/constructs";
import { Auth } from "./auth";
import { DNS } from "./dns";
import { Dynamo } from "./dynamo";

export function Site({ stack }: StackContext) {
  const auth = use(Auth);
  const dynamo = use(Dynamo);
  const dns = use(DNS);

  const site = new AstroSite(stack, "site", {
    bind: [auth, dynamo],
    path: "packages/astro",
    customDomain: {
      hostedZone: dns.zone,
      domainName: dns.domain,
    },
  });
}
