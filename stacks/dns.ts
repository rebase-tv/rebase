import { StackContext } from "sst/constructs";

export function DNS({ stack }: StackContext) {
  const zone = "rebase.tv";
  const domain = stack.stage === "production" ? zone : `${stack.stage}.${zone}`;
  return { zone, domain };
}
