import { z } from "zod"
import { DateTime } from "luxon"

export function zod<
  Schema extends z.ZodSchema<any, any, any>,
  Return extends any
>(schema: Schema, func: (value: z.infer<Schema>) => Return) {
  const result = (input: z.infer<Schema>, skipParse?: boolean) => {
    const parsed = skipParse ? input : result.schema.parse(input)
    return func(parsed)
  }
  result.schema = schema || z.any()
  return result
}

export const iso8601 = () =>
  z
    .string()
    .refine(DateTime.fromISO, { message: "Not a valid ISO string date" })

export const timestamps = z.object({
  created: iso8601(),
  updated: iso8601(),
  deleted: iso8601().optional(),
})
