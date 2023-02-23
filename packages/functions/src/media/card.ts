import chromium from "chrome-aws-lambda"
import os from "os"
import { Api, ApiHandler, useDomainName, useQueryParam } from "sst/node/api"
import { Config } from "sst/node/config"

const realShit = "/usr/bin/google-chrome-stable"
const weakShit = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

export const handler = ApiHandler(async (evt) => {
  const user = useQueryParam("u")
  if (!user) {
    throw new Error("User missing")
  }

  let result = null
  let browser = null

  await chromium.font(
    "https://fonts.gstatic.com/s/firamono/v14/N0bX2SlFPv1weGeLZDtgKP7Ss9XZYalI.woff2"
  )
  await chromium.font(
    "https://fonts.gstatic.com/s/firamono/v14/N0bS2SlFPv1weGeLZDto1d3HkPfUS5NBBASF.woff2"
  )
  await chromium.font(
    "https://fonts.gstatic.com/s/firamono/v14/N0bS2SlFPv1weGeLZDtondvHkPfUS5NBBASF.woff2"
  )

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
        "/ticket?u=" +
        user
    )

    result = await page.screenshot()
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
      "cache-control": "public, max-age=31536000",
    },
  }
})
