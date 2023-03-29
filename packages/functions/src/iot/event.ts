import { EventPayloads } from "@rebase/core/bus"
import { Question } from "@rebase/core/question"
import { Stream } from "@rebase/core/stream"
import {} from "@rebase/core/game"

export async function handler(evt: EventPayloads) {
  if (evt.type === "game.question.assigned") {
    await Promise.all([
      Question.setUsed(evt.properties.question.questionID),
      Stream.publish(evt),
    ])
  }
}
