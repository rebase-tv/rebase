export * as Bus from "./bus"

import type { Question } from "./question"
import { Realtime } from "./realtime"

export interface Events {
  "game.question.assigned": {
    gameID: string
    question: Question.Info
  }
  "game.question.closed": {
    gameID: string
    questionID: string
  }
  "game.question.results": {
    gameID: string
    questionID: string
    correct: string
    results: Record<string, number>
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
