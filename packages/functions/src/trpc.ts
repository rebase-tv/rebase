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

export const router = t.router({
  stream_create: query(Stream.create),
  realtime_endpoint: query(Realtime.endpoint),
  question_list: query(Question.list),
  game_question_create: mutation(Game.create),
  game_question_close: mutation(Game.closeQuestion),
  game_question_assign: mutation(Game.assignQuestion),
  game_answer: mutation(Game.answerQuestion),
  game_from_id: query(Game.fromID),
})

export type Router = typeof router

export function query<
  S extends z.ZodSchema<any, any, any>,
  Fn extends (input: any) => any
>(fn: Fn & { schema: S }) {
  return t.procedure.input<S>(fn.schema).query((req) => {
    return fn(req.input) as Awaited<ReturnType<Fn>>
  })
}

export function mutation<
  S extends z.ZodSchema<any, any, any>,
  Fn extends (input: any) => any
>(fn: Fn & { schema: S }) {
  return t.procedure.input(fn.schema).mutation((req) => {
    return fn(req.input) as Awaited<ReturnType<typeof fn>>
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
