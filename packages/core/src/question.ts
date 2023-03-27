export * as Question from "./question"

import { z } from "zod"
import { zod } from "./zod"
import Airtable from "airtable"
import { Config } from "sst/node/config"
import { assertHost } from "./actor"
import { Bus } from "./bus"

declare module "./bus" {
  export interface Events {
    "game.question": Info
    "game.question.used": {
      id: string
    }
  }
}

Airtable.configure({
  apiKey: Config.AIRTABLE_TOKEN,
})
const Table = Airtable.base("appqDOnASoKwHWOoO").table<{
  text: string
  used: string
  answer_correct: string
  answer_wrong_1: string
  answer_wrong_2: string
}>("Denormalized")

const Info = z.object({
  id: z.string(),
  text: z.string(),
  answers: z.string().array(),
})
export type Info = z.infer<typeof Info>

export const list = zod(z.void(), async () => {
  await assertHost()
  const results = await Table.select({
    filterByFormula: `{Used} = BLANK()`,
  }).all()

  return results.map(
    (result): Info => ({
      id: result.id,
      text: result.fields.text,
      answers: [
        result.fields.answer_correct,
        result.fields.answer_wrong_1,
        result.fields.answer_wrong_2,
      ].sort(() => Math.random() - 0.5),
    })
  )
})

export const setUsed = zod(z.string(), async (id) => {
  await Table.update(id, {
    used: new Date().toISOString(),
  })
  await Bus.publish("game.question.used", { id })
})
