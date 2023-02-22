import { AuthHandler, GithubAdapter } from "sst/node/auth2";
import { Octokit } from "@octokit/rest";
import { User } from "@rebase/core/user";

declare module "sst/node/auth" {
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
      clientID: "435271b928d4655c8bc0",
      clientSecret: "7fc49b9f9f788772c17e2134cd02963c10902d78",
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
