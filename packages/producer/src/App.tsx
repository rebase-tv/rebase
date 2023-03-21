import type { Component, ParentProps } from "solid-js"
import { httpBatchLink } from "@trpc/client"
import { QueryClient, createQuery } from "@tanstack/solid-query"
import { trpc } from "./data/trpc"
import { Router, Routes } from "@solidjs/router"
import { Realtime } from "./Realtime"
import { Bus } from "./data/bus"

const App: Component = () => {
  const fragment = new URLSearchParams(location.hash.slice(1))
  if (fragment.get("access_token")) {
    localStorage.setItem("token", fragment.get("access_token")!)
    location.hash = ""
  }
  const token = localStorage.getItem("token")
  if (!token) {
    const params = new URLSearchParams({
      client_id: "local",
      redirect_uri: location.origin,
      response_type: "token",
      provider: "github",
    })
    location.href =
      import.meta.env.VITE_AUTH_URL + "/authorize?" + params.toString()
    return
  }
  const client = trpc.createClient({
    links: [
      httpBatchLink({
        url: import.meta.env.VITE_API_URL,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }),
    ],
  })

  const queryClient = new QueryClient()

  Bus.on("game.question", (question) => {
    alert(question.text)
  })

  return (
    <Router>
      <trpc.Provider client={client} queryClient={queryClient}>
        <Realtime />
        <button
          onClick={() => {
            Bus.publish("game.question", {
              id: "1",
              text: "What is the answer to life, the universe, and everything?",
              choices: [
                {
                  id: "1",
                  text: "42",
                },
                {
                  id: "2",
                  text: "43",
                },
                {
                  id: "3",
                  text: "44",
                },
              ],
            })
          }}
        >
          Send question
        </button>
      </trpc.Provider>
    </Router>
  )
}

export default App
