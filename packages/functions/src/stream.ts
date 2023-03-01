import { ApiHandler } from "sst/node/api"
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager"
import jwt from "jsonwebtoken"

const client = new SecretsManagerClient({})
const response = await client.send(
  new GetSecretValueCommand({ SecretId: process.env.SECRET_ARN })
)
const privateKey = response.SecretString as string
const decodedPrivateKey = Buffer.from(privateKey, "base64").toString("utf8")

export const handler = ApiHandler(async (evt) => {
  const payload = {
    "aws:channel-arn": process.env.CHANNEL_ARN,
    "aws:access-control-allow-origin": "*",
    exp: Date.now() + 60 * 60 * 1000,
  }
  const encoded = jwt.sign(payload, decodedPrivateKey, { algorithm: "ES384" })
  const channelUrl = process.env.CHANNEL_URL
  const streamUrl = `${channelUrl}?token=${encoded}`

  return {
    statusCode: 200,
    body: JSON.stringify({ streamUrl }),
  }
})
