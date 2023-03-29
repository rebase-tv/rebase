export * as Game from "./game"

import { CustomAttributeType, Entity } from "electrodb"
import { ulid } from "ulid"
import { z } from "zod"
import { Dynamo } from "./dynamo"
import { zod } from "./zod"
import { Question } from "./question"
import { assertActor } from "./actor"
import { Bus } from "./bus"

declare module "./bus" {
  export interface Events {
    "game.question.assigned": {
      gameID: string
      question: Question.Info
    }
    "game.question.closed": {
      gameID: string
      questionID: string
    }
    "game.question.used": {
      id: string
    }
  }
}

const GameEntity = new Entity(
  {
    model: {
      entity: "game",
      version: "1",
      service: "rebase",
    },
    attributes: {
      gameID: {
        type: "string",
        required: true,
      },
      questions: {
        required: true,
        type: CustomAttributeType<{
          [key: string]: {
            questionID: string
            correct: string
            time: {
              assigned: string
              closed: string
            }
          }
        }>("any"),
        default: () => ({}),
      },
      time: {
        type: "map",
        required: true,
        default: () => ({
          created: new Date().toISOString(),
        }),
        properties: {
          created: {
            type: "string",
            required: true,
          },
        },
      },
    },
    indexes: {
      primary: {
        pk: {
          field: "pk",
          composite: ["gameID"],
        },
        sk: {
          field: "sk",
          composite: [],
        },
      },
    },
  },
  Dynamo.Service
)

const GameAnswerEntity = new Entity(
  {
    model: {
      entity: "game-answer",
      version: "1",
      service: "rebase",
    },
    attributes: {
      userID: {
        type: "string",
        required: true,
      },
      gameID: {
        type: "string",
        required: true,
      },
      questionID: {
        type: "string",
        required: true,
      },
      answer: {
        required: true,
        type: "string",
      },
      correct: {
        type: "boolean",
        required: true,
      },
      time: {
        type: "map",
        required: true,
        default: () => ({
          created: new Date().toISOString(),
        }),
        properties: {
          created: {
            type: "string",
            required: true,
          },
        },
      },
    },
    indexes: {
      primary: {
        pk: {
          field: "pk",
          composite: ["userID", "gameID"],
        },
        sk: {
          field: "sk",
          composite: ["answer"],
        },
      },
      byGame: {
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["gameID", "questionID"],
        },
        sk: {
          field: "gsi1sk",
          composite: [],
        },
      },
    },
  },
  Dynamo.Service
)

export const create = zod(z.void(), async () => {
  const gameID = ulid()
  const result = await GameEntity.create({
    gameID,
  }).go()
  return result.data
})

export const fromID = zod(z.string(), async (input) => {
  const result = await GameEntity.get({
    gameID: input,
  }).go()
  return result.data
})

export const assignQuestion = zod(
  z.object({
    gameID: z.string(),
    questionID: z.string(),
  }),
  async (input) => {
    const question = await Question.fromID(input.questionID)
    await GameEntity.update({
      gameID: input.gameID,
    })
      .data((attr, op) => {
        op.set(attr.questions[input.questionID], {
          questionID: input.questionID,
          correct: question.answers[0],
          time: {
            assigned: new Date().toISOString(),
          },
        })
      })
      .go()
    await Bus.publish("game.question.assigned", {
      question,
      gameID: input.gameID,
    })
  }
)

export const closeQuestion = zod(
  z.object({
    gameID: z.string(),
    questionID: z.string(),
  }),
  async (input) => {
    await GameEntity.update({
      gameID: input.gameID,
    })
      .data((attr, op) => {
        op.set(
          attr.questions[input.questionID].time.closed,
          new Date().toISOString()
        )
      })
      .go()
  }
)

export const answerQuestion = zod(
  z.object({
    gameID: z.string(),
    questionID: z.string(),
    answer: z.string(),
  }),
  async (input) => {
    const user = assertActor("user")
    const game = await fromID(input.gameID)
    if (!game) throw new Error("Game not found")
    const question = game.questions[input.questionID]
    if (!question) throw new Error("Question not found")
    if (question.time.closed) throw new Error("Question already closed")
    const correct = question.correct === input.answer
    const answers = await GameAnswerEntity.query
      .primary({
        gameID: input.gameID,
        userID: user.properties.userID,
      })
      .go()

    if (answers.data.some((a) => !a.correct))
      throw new Error("This user is eliminated from this game")

    await GameAnswerEntity.create({
      gameID: input.gameID,
      userID: user.properties.userID,
      questionID: input.questionID,
      answer: input.answer,
      correct,
    }).go()
  }
)

export const results = zod(
  z.object({
    gameID: z.string(),
    questionID: z.string(),
  }),
  async (input) => {
    const results = await GameAnswerEntity.query
      .byGame({
        gameID: input.gameID,
        questionID: input.questionID,
      })
      .go()

    return results.data.reduce((acc, curr) => {
      const exists = acc[curr.answer] || 0
      acc[curr.answer] = exists + 1
      return acc
    }, {} as Record<string, number>)
  }
)