import type { APIContext } from "astro"
import { Session } from "sst/node/auth2"

export async function get(ctx: APIContext) {
  // This is not doing the complete oauth flow, will fix later
  const code = ctx.url.searchParams.get("code")
  if (!code) {
    throw new Error("Code missing")
  }
  const result = Session.verify(code)
  if (!result) throw new Error("Invalid code")
  ctx.cookies.set("session", code, {
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  })
  return ctx.redirect("/ticket", 302)
}
