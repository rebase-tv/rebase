import { z } from "zod"

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
