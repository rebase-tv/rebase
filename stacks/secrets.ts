import { Config, StackContext } from "sst/constructs"

export function Secrets({ stack }: StackContext) {
  return Config.Secret.create(stack, "AIRTABLE_TOKEN")
}
