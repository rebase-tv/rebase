import type { Component, ParentProps } from "solid-js"
import { httpBatchLink } from "@trpc/client"
import { QueryClient, createQuery } from "@tanstack/solid-query"
import { trpc } from "./data/trpc"
import { Router, Routes } from "@solidjs/router"
import { Realtime } from "./Realtime"

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

  return (
    <Router>
      <trpc.Provider client={client} queryClient={queryClient}>
        <Realtime />
      </trpc.Provider>
    </Router>
  )
}

export default App
