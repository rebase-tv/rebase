import { StackContext, Api as SSTApi, use } from "sst/constructs"
import { DNS } from "./dns"
import { Stream } from "./stream"
import fs from "fs/promises"
import { PolicyStatement } from "aws-cdk-lib/aws-iam"

export function Api({ stack }: StackContext) {
  const dns = use(DNS)
  const stream = use(Stream)

  const api = new SSTApi(stack, "api", {
    routes: {
      "GET /stream": {
        function: {
          handler: "packages/functions/src/stream.handler",
          environment: {
            SECRET_ARN: stream.secret.secretArn,
            CHANNEL_ARN: stream.channel.channelArn,
            CHANNEL_URL: stream.channel.channelPlaybackUrl,
          },
          initialPolicy: [
            new PolicyStatement({
              actions: [
                "secretsmanager:GetResourcePolicy",
                "secretsmanager:GetSecretValue",
                "secretsmanager:DescribeSecret",
                "secretsmanager:ListSecretVersionIds",
              ],
              resources: [stream.secret.secretArn],
            }),
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
