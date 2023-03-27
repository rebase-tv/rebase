import { For } from "solid-js"
import { Bus } from "./data/bus"
import { trpc } from "./data/trpc"

export function Control() {
  const questions = trpc.question_list.useQuery()

  Bus.on("game.question.used", () => questions.refetch())

  return (
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
              <td>{question.id}</td>
              <td>{question.text}</td>
              <td>
                <button
                  onClick={() => {
                    Bus.publish("game.question", question)
                  }}
                  class="text-xs bg-green-50 py-1 px-4 border-[1px] border-green-900"
                >
                  Send Question
                </button>
              </td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  )
}
