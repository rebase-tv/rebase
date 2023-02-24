import type { APIContext } from "astro"
import { useUserSession } from "@data/session"
import { User } from "@rebase/core/user"

export async function get(ctx: APIContext) {
  const session = useUserSession(ctx.cookies)
  if (!session) return new Response("Unauthorized", { status: 401 })

  const user = await User.fromID(session.properties.userID)
  return new Response(JSON.stringify(user))
}
