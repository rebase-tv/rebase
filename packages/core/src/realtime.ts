export * as Realtime from "./realtime"
import { z } from "zod"
import { assertHost } from "./actor"
import { zod } from "./zod"
import { IoTClient, DescribeEndpointCommand } from "@aws-sdk/client-iot"
import {
  IoTDataPlaneClient,
  PublishCommand,
} from "@aws-sdk/client-iot-data-plane"
import { Config } from "sst/node/config"

const iot = new IoTClient({})
const data = new IoTDataPlaneClient({})

export const endpoint = zod(z.void(), async () => {
  await assertHost()
  const result = await iot.send(
    new DescribeEndpointCommand({
      endpointType: "iot:Data-ATS",
    })
  )
  return result.endpointAddress!
})

export async function publish(topic: string, payload: any) {
  await data.send(
    new PublishCommand({
      payload: Buffer.from(JSON.stringify(payload)),
      topic: `rebase/${Config.STAGE}/${topic}`,
    })
  )
}
