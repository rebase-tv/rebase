import { awsLambdaRequestHandler } from "@trpc/server/adapters/aws-lambda"
import { initTRPC } from "@trpc/server"
import { z } from "zod"
import { ApiHandler } from "sst/node/api"
import { Stream } from "@rebase/core/stream"
import { useSession } from "sst/node/future/auth"
import { provideActor } from "@rebase/core/actor"

export const t = initTRPC.create()

const router = t.router({
  stream_create: expose(Stream.create),
})

export type Router = typeof router

export function expose<
  T extends ((input: any) => F) & { schema: z.ZodSchema<any, any, any> },
  F = ReturnType<T>
>(fn: T) {
  return t.procedure.input(fn.schema).query((req): F => {
    return fn(req.input)
  })
}

const trpc = awsLambdaRequestHandler({
  router,
  createContext: async () => {
    const session = useSession()
    provideActor(session)
  },
})

export const handler = ApiHandler(async (req, ctx) => {
  return trpc(req, ctx)
})
