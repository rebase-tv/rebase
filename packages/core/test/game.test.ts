import { expect, it } from "vitest"
import { provideActor } from "../src/actor"
import { Game } from "../src/game"
import { Question } from "../src/question"

provideActor({
  type: "system",
  properties: {},
})
const [question] = await Question.list()
const SAMPLE_QUESTION = question
console.log("Sample question", SAMPLE_QUESTION)

it("create game", async () => {
  const game = await Game.create()
  const match = await Game.fromID(game.gameID)
  expect(match).toEqual(game)
})

it("assign question", async () => {
  const game = await Game.create()
  await Game.assignQuestion({
    gameID: game.gameID,
    questionID: SAMPLE_QUESTION.questionID,
  })

  const match = await Game.fromID(game.gameID)

  expect(match!.questions[SAMPLE_QUESTION.questionID]).not.toBeUndefined()
})

it("close question", async () => {
  const game = await Game.create()
  await Game.assignQuestion({
    gameID: game.gameID,
    questionID: SAMPLE_QUESTION.questionID,
  })

  await Game.closeQuestion({
    gameID: game.gameID,
    questionID: SAMPLE_QUESTION.questionID,
  })

  const match = await Game.fromID(game.gameID)

  expect(
    match!.questions[SAMPLE_QUESTION.questionID].time.closed
  ).not.toBeUndefined()
})

it("answer correctly", async () => {
  const game = await Game.create()
  await Game.assignQuestion({
    gameID: game.gameID,
    questionID: question.questionID,
  })

  provideActor({
    type: "user",
    properties: {
      userID: "user",
    },
  })
  await Game.answerQuestion({
    gameID: game.gameID,
    questionID: question.questionID,
    answer: question.answers[0],
  })

  const results = await Game.results({
    gameID: game.gameID,
    questionID: SAMPLE_QUESTION.questionID,
  })
  expect(results[SAMPLE_QUESTION.answers[0]]).toEqual(1)
})

it("cannot answer twice", async () => {
  const game = await Game.create()
  await Game.assignQuestion({
    gameID: game.gameID,
    questionID: SAMPLE_QUESTION.questionID,
  })

  provideActor({
    type: "user",
    properties: {
      userID: "user",
    },
  })
  await Game.answerQuestion({
    gameID: game.gameID,
    questionID: SAMPLE_QUESTION.questionID,
    answer: SAMPLE_QUESTION.answers[0],
  })
  await expect(async () => {
    await Game.answerQuestion({
      gameID: game.gameID,
      questionID: SAMPLE_QUESTION.questionID,
      answer: SAMPLE_QUESTION.answers[0],
    })
  }).rejects.toThrow()
})

it("cannot answer closed question", async () => {
  const game = await Game.create()
  await Game.assignQuestion({
    gameID: game.gameID,
    questionID: SAMPLE_QUESTION.questionID,
  })

  provideActor({
    type: "user",
    properties: {
      userID: "user",
    },
  })
  await Game.closeQuestion({
    gameID: game.gameID,
    questionID: SAMPLE_QUESTION.questionID,
  })
  await expect(async () => {
    await Game.answerQuestion({
      gameID: game.gameID,
      questionID: SAMPLE_QUESTION.questionID,
      answer: SAMPLE_QUESTION.answers[0],
    })
  }).rejects.toThrow(/Question already closed/)
})