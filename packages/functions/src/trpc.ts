import { awsLambdaRequestHandler } from "@trpc/server/adapters/aws-lambda"
import { initTRPC } from "@trpc/server"
import { z } from "zod"
import { ApiHandler } from "sst/node/api"
import { Stream } from "@rebase/core/stream"
import { useSession } from "sst/node/future/auth"
import { provideActor } from "@rebase/core/actor"
import { Realtime } from "@rebase/core/realtime"
import { Question } from "@rebase/core/question"
import { Game } from "@rebase/core/game"

export const t = initTRPC.create()

const router = t.router({
  stream_create: query(Stream.create),
  realtime_endpoint: query(Realtime.endpoint),
  question_list: query(Question.list),
  game_question_create: t.procedure
    .input(Game.create.schema)
    .mutation(async (req) => Game.create(req.input)),
  game_question_assign: t.procedure
    .input(Game.assignQuestion.schema)
    .mutation((req) => Game.assignQuestion(req.input)),
})

export type Router = typeof router

export function query<
  T extends ((input: any) => any) & { schema: z.ZodSchema<any, any, any> }
>(fn: T) {
  return t.procedure.input(fn.schema).query((req) => {
    return fn(req.input) as Awaited<ReturnType<T>>
  })
}

export function mutation<
  T extends ((input: any) => any) & { schema: z.ZodSchema<any, any, any> }
>(fn: T) {
  return t.procedure.input(fn.schema).mutation((req) => {
    return fn(req.input) as Awaited<ReturnType<T>>
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
