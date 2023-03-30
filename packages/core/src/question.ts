export * as Question from "./question"

import { z } from "zod"
import { zod } from "./zod"
import Airtable from "airtable"
import { Config } from "sst/node/config"
import { assertHost } from "./actor"
import { Bus } from "./bus"

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
  questionID: z.string(),
  text: z.string(),
  answers: z.string().array(),
})
export type Info = z.infer<typeof Info>

export const list = zod(z.void(), async () => {
  await assertHost()
  const results = await Table.select({
    filterByFormula: `{Used} = BLANK()`,
  }).all()

  return results.map(deserialize)
})

export const setUsed = zod(z.string(), async (id) => {
  await Table.update(id, {
    used: new Date().toISOString(),
  })
})

export const fromID = zod(z.string(), async (id) => {
  const result = await Table.find(id)
  return deserialize(result)
})

function deserialize(result: any): Info {
  return {
    questionID: result.id,
    text: result.fields.text,
    answers: [
      result.fields.answer_correct,
      result.fields.answer_wrong_1,
      result.fields.answer_wrong_2,
    ],
  }
}
