import { StackContext, Api as SSTApi, use } from "sst/constructs"
import { DNS } from "./dns"
import fs from "fs/promises"

export function Api({ stack }: StackContext) {
  const dns = use(DNS)

  const api = new SSTApi(stack, "api", {
    routes: {
      "GET /media/card": {
        function: {
          handler: "packages/functions/src/media/card.handler",
          runtime: "nodejs14.x",
          nodejs: {
            // This skips bundling for this dependency and instead just installs it normally
            // Probably needed for the binary dependency
            install: ["chrome-aws-lambda", "imagemin", "imagemin-pngquant"],
            banner: [
              `import url from "url"`,
              `const __dirname = url.fileURLToPath(new URL(".", import.meta.url))`,
            ].join("\n"),
          },
          copyFiles: [{ from: "fonts" }],
          hooks: {
            afterBuild: async (_, out) => {
              await fs.cp(
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
