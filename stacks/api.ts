import { StackContext, Api as SSTApi, use } from "sst/constructs"
import { DNS } from "./dns"
import { Stream } from "./stream"
import fs from "fs/promises"

export function Api({ stack }: StackContext) {
  const dns = use(DNS)
  const stream = use(Stream)

  const api = new SSTApi(stack, "api", {
    routes: {
      "GET /stream": {
        function: {
          handler: "packages/functions/src/stream.handler",
          bind: [
            stream.STREAM_PRIVATE_KEY,
            stream.STREAM_CHANNEL_ARN,
            stream.STREAM_CHANNEL_URL,
          ],
        },
      },
      "GET /{proxy+}": {
        function: {
          handler: "packages/functions/src/trpc.handler",
          bind: [
            stream.STREAM_PRIVATE_KEY,
            stream.STREAM_CHANNEL_ARN,
            stream.STREAM_CHANNEL_URL,
          ],
        },
      },
      "GET /media/card.png": {
        function: {
          handler: "packages/functions/src/media/card.handler",
          runtime: "nodejs14.x",
          nodejs: {
            // This skips bundling for this dependency and instead just installs it normally
            // Probably needed for the binary dependency
            install: ["chrome-aws-lambda", "imagemin", "imagemin-pngquant"],
          },
          copyFiles: [{ from: "fonts" }],
          hooks: {
            afterBuild: async (_, out) => {
              await fs.copyFile(
                "./bin/pngquant",
                out + `/node_modules/pngquant-bin/vendor/pngquant`
              )
            },
          },
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
