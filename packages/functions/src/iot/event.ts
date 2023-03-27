import { EventPayloads } from "@rebase/core/bus"
import { Question } from "@rebase/core/question"
import { Stream } from "@rebase/core/stream"

export async function handler(evt: EventPayloads) {
  if (evt.type === "game.question") {
    await Promise.all([
      Question.setUsed(evt.properties.id),
      Stream.publish(evt),
    ])
  }
}
