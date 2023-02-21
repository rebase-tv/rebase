import type { APIContext } from "astro";

export async function get(ctx: APIContext) {
  // This is not doing the complete oauth flow, will fix later
  const code = ctx.url.searchParams.get("code");
  if (!code) {
    throw new Error("Code missing");
  }
  ctx.cookies.set("session", code, {
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return ctx.redirect("/", 302);
}
