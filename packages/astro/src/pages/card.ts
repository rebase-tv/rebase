import type { APIContext } from "astro"
import chromium from "chrome-aws-lambda"
import os from "os"

const realShit = "/usr/bin/google-chrome-stable"
const weakShit = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

export async function get(ctx: APIContext) {
  const user = ctx.url.searchParams.get("u")
  if (!user) {
    throw new Error("User missing")
  }

  let result = null
  let browser = null

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: chromium.headless
        ? await chromium.executablePath
        : os.platform() === "linux"
        ? realShit
        : weakShit,
      headless: true,
      ignoreHTTPSErrors: true,
    })

    const page = await browser.newPage()
    page.setViewport({ width: 1200, height: 630 })
    await page.goto(ctx.url.origin + "/ticket" + ctx.url.search)

    result = await page.screenshot()
  } catch (error) {
    console.error(error)
  } finally {
    if (browser !== null) {
      await browser.close()
    }
  }

  return new Response(result as any, {
    headers: {
      "cache-control": "public, max-age=31536000",
    },
  })
}
