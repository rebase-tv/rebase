import type { Router } from "@rebase/functions/trpc" // your router type
import { createTRPCSolid } from "solid-trpc"

export const trpc = createTRPCSolid<Router>()
