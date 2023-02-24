import {
  AuthHandler,
  GithubAdapter,
  OauthAdapter,
  OidcAdapter,
} from "sst/node/auth2"
import { Octokit } from "@octokit/rest"
import { Config } from "sst/node/config"
import { User } from "@rebase/core/user"
import { Issuer } from "openid-client"
import "sst/node/auth2"
import { useCookie, useQueryParam, useResponse } from "sst/node/api"
import { Client as Twitter } from "twitter-api-sdk"
import { fetch } from "undici"

declare module "sst/node/auth2" {
  export interface SessionTypes {
    user: {
      userID: string
    }
  }
}

export const handler = AuthHandler({
  clients: async () => ({
    local: "http://localhost",
  }),
  providers: {
    google: OidcAdapter({
      scope:
        "openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      issuer: await Issuer.discover("https://accounts.google.com"),
      clientID:
        "43908644348-ficcruqi5btsf2kgt3bjgvqveemh103m.apps.googleusercontent.com",
    }),
    github: GithubAdapter({
      scope: "read:user user:email",
      clientID: Config.GITHUB_CLIENT_ID,
      clientSecret: Config.GITHUB_CLIENT_SECRET,
    }),
    twitter: OauthAdapter({
      clientID: "ZkRleTN1Ql9IdHdfQ0h5V2FJUTY6MTpjaQ",
      clientSecret: "OhcSgbG66noSIvlnLmgNcE6Ix1Zj5d7szvMQy1AHC9NODp0xoS",
      scope: "users.read tweet.read",
      issuer: new Issuer({
        issuer: "https://twitter.com",
        authorization_endpoint: "https://twitter.com/i/oauth2/authorize",
        token_endpoint: "https://api.twitter.com/2/oauth2/token",
      }),
    }),
  },
  async onAuthorize() {
    const ref = useQueryParam("ref")
    if (ref)
      useResponse().cookie({
        key: "ref",
        value: ref,
        httpOnly: true,
        secure: true,
        maxAge: 60 * 10,
        sameSite: "None",
      })
  },
  async onSuccess(input) {
    let user: User.Info | undefined = undefined

    if (input.provider === "github") {
      const o = new Octokit({
        auth: input.tokenset.access_token,
      })
      const me = await o.users.getAuthenticated()
      const emails = await o.request("GET /user/emails")
      const email = emails.data.find((x) => x.primary)?.email
      if (!email) throw new Error("No email found")
      const exists = await User.fromEmail(email)
      exists
        ? (user = exists)
        : (user = await User.create({
            username: me.data.login,
            name: me.data.name || undefined,
            email: email,
            avatar: me.data.avatar_url,
            ref: useCookie("ref"),
          }))
    }

    if (input.provider === "twitter") {
      const client = new Twitter(input.tokenset.access_token!)
      const me = await client.users.findMyUser({
        "user.fields": ["profile_image_url", "username", "id"],
      })
      if (!me.data) throw new Error("No user found")
      console.log("Twitter user", me)
      const email = me.data?.id + "+twitter@rebase.tv"
      const exists = await User.fromEmail(email)
      exists
        ? (user = exists)
        : (user = await User.create({
            username: me.data!.username,
            name: me.data.name || undefined,
            email: email,
            avatar: me.data.profile_image_url!.replace("_normal", "_400x400"),
            ref: useCookie("ref"),
          }))
    }

    if (input.provider === "google") {
      const claims = input.tokenset.claims()
      const email = claims.email
      if (!email) throw new Error("No email found")
      const exists = await User.fromEmail(email)
      exists
        ? (user = exists)
        : (user = await User.create({
            username: email.split("@")[0],
            name: claims.name!,
            email: email,
            avatar: claims.picture?.replace("s96-c", "s400-c") || "",
            ref: useCookie("ref"),
          }))
    }

    return {
      type: "user",
      properties: {
        userID: user!.userID,
      },
    }
  },
})
