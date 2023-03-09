import { Config } from "sst/node/config"
import { z } from "zod"
import { zod } from "./zod"
import jwt from "jsonwebtoken"
import { assertActor } from "./actor"

export * as Stream from "./stream"

const decodedPrivateKey = Buffer.from(
  Config.STREAM_PRIVATE_KEY,
  "base64"
).toString("utf8")

export const create = zod(z.any(), () => {
  const payload = {
    "aws:channel-arn": Config.STREAM_CHANNEL_ARN,
    "aws:access-control-allow-origin": "*",
    exp: Date.now() + 60 * 60 * 1000,
  }
  const encoded = jwt.sign(payload, decodedPrivateKey, { algorithm: "ES384" })
  const streamUrl = `${Config.STREAM_CHANNEL_URL}?token=${encoded}`
  console.log("Stream url", streamUrl)
  return { url: streamUrl }
})
