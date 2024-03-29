import { ApiHandler } from "sst/node/api"
import jwt from "jsonwebtoken"
import { Config } from "sst/node/config"

const decodedPrivateKey = Buffer.from(
  Config.STREAM_PRIVATE_KEY,
  "base64"
).toString("utf8")

export const handler = ApiHandler(async () => {
  const payload = {
    "aws:channel-arn": Config.STREAM_CHANNEL_ARN,
    "aws:access-control-allow-origin": "*",
    exp: Date.now() + 60 * 60 * 1000,
  }
  const encoded = jwt.sign(payload, decodedPrivateKey, { algorithm: "ES384" })
  const streamUrl = `${Config.STREAM_CHANNEL_URL}?token=${encoded}`

  return {
    statusCode: 200,
    body: JSON.stringify({ streamUrl }),
  }
})
