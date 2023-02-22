import { StackContext, use, Auth as SSTAuth } from "sst/constructs";
import { DNS } from "./dns";
import { Dynamo } from "./dynamo";

export function Auth({ stack }: StackContext) {
  const dns = use(DNS);
  const dynamo = use(Dynamo);

  const auth = new SSTAuth(stack, "auth", {
    customDomain: {
      domainName: "auth." + dns.domain,
      hostedZone: dns.zone,
    },
    authenticator: {
      handler: "packages/functions/src/auth.handler",
      bind: [dynamo],
    },
  });

  return auth;
}
