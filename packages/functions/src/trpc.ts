import {
  CreateAWSLambdaContextOptions,
  awsLambdaRequestHandler,
} from "@trpc/server/adapters/aws-lambda"
import { inferAsyncReturnType, initTRPC } from "@trpc/server"
import { APIGatewayProxyEventV2 } from "aws-lambda"
import { z } from "zod"
import { ApiHandler } from "sst/node/api"
import { useSession } from "sst/node/auth2"

export const t = initTRPC.create()

const router = t.router({
  stream_create: t.procedure.input(z.string()).query((req) => {
    return "hey"
  }),
})

const trpc = awsLambdaRequestHandler({
  router,
  async createContext() {
    useSession()
  },
})

export const handler = ApiHandler(async (req, ctx) => {
  return trpc(req, ctx)
})
