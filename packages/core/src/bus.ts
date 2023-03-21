import { Realtime } from "./realtime"

export interface Events {
  "host.connected": {}
  "game.question": {
    id: string
    text: string
    choices: {
      id: string
      text: string
    }[]
  }
}

export type EventPayloads = {
  [T in keyof Events]: {
    type: T
    properties: Events[T]
    source: string
  }
}[keyof Events]

export async function publish<T extends keyof Events>(
  type: T,
  properties: Events[T]
) {
  const payload = {
    type,
    properties,
    source: "system",
  }
  await Realtime.publish(type, payload)
}
