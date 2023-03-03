import type { AstroCookies } from "astro"
import { Session } from "sst/node/future/auth"

declare module "sst/node/future/auth" {
  export interface SessionTypes {
    user: {
      userID: string
    }
  }
}

export function useSession(cookies: AstroCookies) {
  const cookie = cookies.get("session")
  if (!cookie.value) return
  const session = Session.verify(cookie.value)
  if (!session) return
  return session
}

export function useUserSession(cookies: AstroCookies) {
  const session = useSession(cookies)
  if (!session) return
  if (session.type !== "user") return
  return session
}
