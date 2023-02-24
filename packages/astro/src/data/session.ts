import type { AstroCookies } from "astro"
import { Session, SessionValue } from "sst/node/auth2"

declare module "sst/node/auth2" {
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
  return session as Extract<SessionValue, { type: "user" }>
}

export function useUserSession(cookies: AstroCookies) {
  const session = useSession(cookies)
  if (!session) return
  if (session.type !== "user") return
  return session
}
