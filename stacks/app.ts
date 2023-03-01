import { StackContext, StaticSite, use } from "sst/constructs"
import { Api } from "./api"

export function App({ stack, app }: StackContext) {
  if (app.mode === "dev") {
    const { url, customDomainUrl } = use(Api)

    const app = new StaticSite(stack, "app", {
      path: "packages/app",
      environment: {
        API_URL: customDomainUrl || url,
      },
    })
  }
}
