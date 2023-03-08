import React from "react"
import Constants from "expo-constants"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink, createTRPCProxyClient } from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"

import type { Router } from "../../functions/src/trpc"

/**
 * A set of typesafe hooks for consuming your API.
 */
export const trpc = createTRPCReact<Router>()

/**
 * A wrapper for your app that provides the TRPC context.
 * Use only in _app.tsx
 */
export const TRPCProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [queryClient] = React.useState(() => new QueryClient())
  const [trpcClient] = React.useState(() =>
    // @ts-expect-error
    trpc.createClient({
      links: [
        httpBatchLink({
          url: Constants.expoConfig.extra?.apiUrl,
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
