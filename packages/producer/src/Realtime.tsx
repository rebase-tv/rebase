import { trpc } from "./data/trpc"
import { iot, mqtt } from "aws-iot-device-sdk-v2"
import { createEffect, onCleanup } from "solid-js"
import { Bus, bus, publisher } from "./data/bus"

export function Realtime() {
  const stream = trpc.realtime_endpoint.useQuery()

  let connection: mqtt.MqttClientConnection

  publisher.listen((evt) => {
    connection.publish(`/rebase/${evt.type}`, JSON.stringify(evt), 0)
  })

  createEffect(async () => {
    const url = stream.data
    if (!url) return
    const config = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
      .with_clean_session(true)
      .with_client_id("client_" + Date.now().toString())
      .with_endpoint(url)
      .with_custom_authorizer(
        "",
        "thdxr-rebase-authorizer",
        "",
        localStorage.getItem("token")!
      )
      .with_keep_alive_seconds(30)
      .build()

    const client = new mqtt.MqttClient()
    connection = client.new_connection(config)

    connection.on("connect", async () => {
      console.log("WS connected")
    })
    connection.on("interrupt", console.log)
    connection.on("error", console.log)
    connection.on("resume", console.log)
    connection.on("message", (_topic, payload) => {
      const message = new TextDecoder("utf8").decode(new Uint8Array(payload))
      const parsed = JSON.parse(message)
      console.log("Got message", parsed)
      bus.emit(parsed.type, parsed.properties)
    })
    connection.on("disconnect", console.log)
    await connection.connect()
    await connection.subscribe("/rebase/#", mqtt.QoS.AtLeastOnce)
    Bus.publish("host.connected", {})
  })

  onCleanup(() => {
    connection.disconnect()
  })
  return null
}
