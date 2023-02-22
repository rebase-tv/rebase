import { AuthHandler, GithubAdapter } from "sst/node/auth2";
import { Octokit } from "@octokit/rest";
import { Config } from "sst/node/config";
import { User } from "@rebase/core/user";
import "sst/node/auth2";

declare module "sst/node/auth2" {
  export interface SessionTypes {
    user: {
      userID: string;
    };
  }
}

export const handler = AuthHandler({
  clients: async () => ({
    local: "http://localhost",
  }),
  providers: {
    github: GithubAdapter({
      scope: "",
      clientID: Config.GITHUB_CLIENT_ID,
      clientSecret: Config.GITHUB_CLIENT_SECRET,
    }),
  },
  async onSuccess(input) {
    let user: User.Info | undefined = undefined;

    if (input.provider === "github") {
      const o = new Octokit({
        auth: input.tokenset.access_token,
      });
      const me = await o.users.getAuthenticated();
      if (!me.data.email) throw new Error("No email");
      const exists = await User.fromEmail(me.data.email);
      exists
        ? (user = exists)
        : (user = await User.create({
            username: me.data.login,
            name: me.data.name || undefined,
            email: me.data.email,
            avatar: me.data.avatar_url,
          }));
    }

    return {
      type: "user",
      properties: {
        userID: user!.userID,
      },
    };
  },
});
