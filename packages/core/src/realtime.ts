export * as Realtime from "./realtime"
import { z } from "zod"
import { assertHost } from "./actor"
import { zod } from "./zod"
import { IoTClient, DescribeEndpointCommand } from "@aws-sdk/client-iot"

const client = new IoTClient({})
export const endpoint = zod(z.void(), async () => {
  assertHost()
  const result = await client.send(
    new DescribeEndpointCommand({
      endpointType: "iot:Data-ATS",
    })
  )
  return result.endpointAddress!
})
