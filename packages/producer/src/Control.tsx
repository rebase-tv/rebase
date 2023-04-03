import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  Show,
} from "solid-js"
import { Bus } from "./data/bus"
import { trpc } from "./data/trpc"
import * as IVS from "amazon-ivs-player"
import { EventPayloads } from "@rebase/core/bus"
// @ts-ignore
import wasmBinaryPath from "amazon-ivs-player/dist/assets/amazon-ivs-wasmworker.min.wasm?url"
// @ts-ignore
import wasmWorkerPath from "amazon-ivs-player/dist/assets/amazon-ivs-wasmworker.min.js?url"

export function Control() {
  const questions = trpc.question_list.useQuery()

  const mutation = {
    createGame: trpc.game_question_create.useMutation(),
    assignQuestion: trpc.game_question_assign.useMutation(),
    closeQuestion: trpc.game_question_close.useMutation(),
    publishResults: trpc.game_question_results.useMutation(),
  }

  const game = trpc.game_from_id.useQuery(
    () => mutation.createGame.data?.gameID || "",
    () => ({
      enabled: Boolean(mutation.createGame.data?.gameID),
    })
  )

  const currentQuestion = createMemo(
    () =>
      Object.values(game.data?.questions || {}).sort((b, a) =>
        a.time.assigned.localeCompare(b.time.assigned)
      )[0]
  )

  mutation.createGame.mutateAsync()

  return (
    <div class="fixed inset-0 flex bg-black text-white">
      <div class="flex-1">
        <div class="flex">
          <pre>{JSON.stringify(currentQuestion(), null, 2)}</pre>
          <Show when={currentQuestion()?.time.closed}>
            <button
              class="text-xs text-black bg-green-50 py-1 px-4 border-[1px] border-green-900"
              onClick={() =>
                mutation.publishResults.mutateAsync({
                  gameID: mutation.createGame.data?.gameID!,
                  questionID: currentQuestion()?.questionID!,
                })
              }
            >
              Publish Results
            </button>
          </Show>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Text</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <For each={questions.data || []}>
              {(question) => (
                <tr>
                  <td>{question.questionID}</td>
                  <td>{question.text}</td>
                  <td>
                    <button
                      onClick={async () => {
                        await mutation.assignQuestion.mutateAsync({
                          gameID: mutation.createGame.data?.gameID!,
                          questionID: question.questionID,
                        })
                        game.refetch()
                        questions.refetch()
                        setTimeout(async () => {
                          await mutation.closeQuestion.mutateAsync({
                            gameID: mutation.createGame.data?.gameID!,
                            questionID: question.questionID,
                          })
                          game.refetch()
                        }, 1000 * 20)
                      }}
                      class="text-xs text-black bg-green-50 py-1 px-4 border-[1px] border-green-900"
                    >
                      Send Question
                    </button>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
      <div class="flex-1 flex justify-center">
        <Player />
      </div>
    </div>
  )
}

export function Player() {
  const stream = trpc.stream_create.useQuery()
  const answer = trpc.game_answer.useMutation()

  const playerElement = (
    <video class="w-auth h-full" playsinline controls muted />
  )

  const player = IVS.create({
    wasmWorker: wasmWorkerPath,
    wasmBinary: wasmBinaryPath,
  })

  const [selected, setSelected] = createSignal<string>()
  const [question, setQuestion] =
    createSignal<Extract<EventPayloads, { type: "game.question.assigned" }>>()
  const [results, setResults] =
    createSignal<Extract<EventPayloads, { type: "game.question.results" }>>()
  const [countdown, setCountdown] = createSignal(0)
  let timer: NodeJS.Timer
  createEffect(() => {
    if (!stream.data) return
    player.attachHTMLVideoElement(playerElement as any)
    player.load(stream.data?.url!)
    player.addEventListener(IVS.PlayerEventType.TEXT_METADATA_CUE, (evt) => {
      const parsed: EventPayloads = JSON.parse(evt.text)
      if (parsed.type === "game.question.assigned") {
        batch(() => {
          setQuestion(parsed)
          setResults(undefined)
          setSelected(undefined)
          setCountdown(10)
          timer = setInterval(() => {
            if (countdown() === 0) {
              clearInterval(timer)
              return
            }
            setCountdown((c) => c - 1)
          }, 1000)
        })
      }
      if (parsed.type === "game.question.results") {
        setResults(parsed)
      }
    })
    player.play()
  })

  onCleanup(() => {
    if (timer) clearInterval(timer)
    player.delete()
  })
  return (
    <div class="relative aspect-[9/16] h-full bg-[red]">
      <Show when={question() && (countdown() > 0 || results())}>
        <div class="absolute top-0 left-0 w-full p-4 z-50 flex justify-center">
          <div class="bg-white w-full h-full rounded-3xl p-6 flex flex-col gap-4 max-w-xl">
            <Show when={countdown() > 0}>
              <div class="flex justify-center">
                <div class="rounded-full w-[50px] aspect-square bg-[green] flex justify-center items-center font-bold text-lg">
                  {countdown()}
                </div>
              </div>
            </Show>
            <div class="text-black text-center font-bold text-xl">
              {question()?.properties.question.text}
            </div>
            <div class="flex flex-col gap-4 text-gray-900">
              {question()?.properties.question.answers.map((value) => (
                <div
                  class="bg-gray-200 px-4 rounded-full h-11 flex items-center font-bold"
                  classList={{
                    "bg-purple-500 text-white": selected() === value,
                    "bg-green-500 text-white":
                      results() && results()!.properties.correct === value,
                    "bg-red-500 text-white":
                      results() &&
                      results()!.properties.correct !== value &&
                      selected() === value,
                  }}
                  onClick={() => {
                    setSelected(value)
                    answer.mutateAsync({
                      answer: value,
                      gameID: question()!.properties.gameID,
                      questionID: question()!.properties.question.questionID,
                    })
                  }}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Show>
      {playerElement}
    </div>
  )
}
