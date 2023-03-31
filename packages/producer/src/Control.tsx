import { createEffect, createMemo, For, onCleanup, Show } from "solid-js"
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
  const stream = trpc.stream_create.useQuery()

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

  const playerElement = <video class="w-auth h-full" playsinline controls />

  const player = IVS.create({
    wasmWorker: wasmWorkerPath,
    wasmBinary: wasmBinaryPath,
  })
  createEffect(() => {
    if (!stream.data) return
    player.attachHTMLVideoElement(playerElement as any)
    player.load(stream.data?.url!)
    player.addEventListener(IVS.PlayerEventType.TEXT_METADATA_CUE, (evt) => {
      const parsed: EventPayloads = JSON.parse(evt.text)
      console.log("Got IVS event", parsed)
    })
    player.play()
  })

  onCleanup(() => {
    player.delete()
  })

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
                        }, 1000 * 10)
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
      <div class="flex-1 flex justify-center">{playerElement}</div>
    </div>
  )
}
