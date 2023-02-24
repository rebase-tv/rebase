import type { APIContext } from "astro"
import { Api } from "sst/node/api"

export async function get(ctx: APIContext) {
  return fetch(Api.api.url + "/media/card" + ctx.url.search)
}
