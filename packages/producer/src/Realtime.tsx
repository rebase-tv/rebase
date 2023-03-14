import { trpc } from "./data/trpc"
import { iot, mqtt } from "aws-iot-device-sdk-v2"
import { createEffect } from "solid-js"

export function Realtime() {
  const stream = trpc.realtime_endpoint.useQuery()

  createEffect(() => {
    const url = stream.data
    if (!url) return
    const config = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
      .with_clean_session(true)
      .with_client_id("client_" + Date.now().toString())
      .with_endpoint(url)
      .with_custom_authorizer(
        localStorage.getItem("token")!,
        "thdxr-rebase-authorizer",
        "",
        ""
      )
      .with_keep_alive_seconds(30)
      .build()
    console.log(config)

    const client = new mqtt.MqttClient()
    const connection = client.new_connection(config)

    connection.on("connect", async () => {})
    connection.on("interrupt", console.log)
    connection.on("error", console.log)
    connection.on("resume", console.log)
    connection.on("message", (_topic, payload) => {
      const message = new TextDecoder("utf8").decode(new Uint8Array(payload))
      // bus.emit(JSON.parse(message))
    })
    connection.on("disconnect", console.log)

    connection.connect()
    connection.subscribe("/rebase/#", mqtt.QoS.AtLeastOnce)

    return null
  })
}
