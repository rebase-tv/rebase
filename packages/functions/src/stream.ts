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

export const handler = ApiHandler(async (evt) => {
  const payload = {
    "aws:channel-arn": process.env.CHANNEL_ARN,
    "aws:access-control-allow-origin": "*",
    exp: Date.now() + 60 * 60 * 1000,
  }
  const encoded = jwt.sign(payload, privateKey, { algorithm: "ES384" })
  const streamUrl = `${process.env.CHANNEL_URL}${encoded}`

  return {
    statusCode: 200,
    body: JSON.stringify({ streamUrl }),
  }
})
