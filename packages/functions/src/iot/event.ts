import { EventPayloads } from "@rebase/core/bus"
import { Question } from "@rebase/core/question"
import { Stream } from "@rebase/core/stream"
import {} from "@rebase/core/game"

export async function handler(evt: EventPayloads) {
  if (evt.type === "game.question.assigned") {
    evt.properties.question.answers = evt.properties.question.answers.sort(
      Math.random
    )
    await Promise.all([
      Question.setUsed(evt.properties.question.questionID),
      Stream.publish(evt),
    ])
  }
  if (evt.type === "game.question.closed") {
    Stream.publish(evt)
  }
}
