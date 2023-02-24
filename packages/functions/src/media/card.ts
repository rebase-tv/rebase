import chromium from "chrome-aws-lambda"
import os from "os"
import { ApiHandler, useDomainName, useQueryParam } from "sst/node/api"
import { Config } from "sst/node/config"
import imagemin from "imagemin"
import imageminPngquant from "imagemin-pngquant"

const realShit = "/usr/bin/google-chrome-stable"
const weakShit = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

export const handler = ApiHandler(async (evt) => {
  const user = useQueryParam("u")
  if (!user) {
    throw new Error("User missing")
  }

  let result = null
  let browser = null

  const prefix = process.env.IS_LOCAL ? "" : "/var/task/"
  await chromium.font(`${prefix}fonts/FiraMono-Regular.ttf`)
  await chromium.font(`${prefix}fonts/FiraMono-Medium.ttf`)
  await chromium.font(`${prefix}fonts/FiraMono-Bold.ttf`)

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
    await page.goto(
      (process.env.IS_LOCAL
        ? "http://localhost:3000"
        : "https://" + useDomainName().replace("api.", "")) +
        "/share/ticket?u=" +
        user
    )

    result = (await page.screenshot()) as Buffer

    result = await imagemin.buffer(result, {
      plugins: [imageminPngquant({ quality: [0.7, 0.8] })],
    })
  } catch (error) {
    console.error(error)
  } finally {
    if (browser !== null) {
      await browser.close()
    }
  }

  return {
    statusCode: 200,
    isBase64Encoded: true,
    body: result?.toString("base64"),
    headers: {
      "content-type": "image/png",
      "cache-control": "public,max-age=0,s-maxage=31536000,must-revalidate",
    },
  }
})
