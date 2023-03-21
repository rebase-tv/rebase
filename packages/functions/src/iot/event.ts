import { EventPayloads } from "@rebase/core/bus"
import { Stream } from "@rebase/core/stream"

export async function handler(evt: EventPayloads) {
  if (evt.type === "game.question") {
    await Stream.publish(evt)
  }
}
