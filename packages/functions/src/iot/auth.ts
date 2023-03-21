import { assertHost, provideActor } from "@rebase/core/actor"
import { Auth, Session } from "sst/node/future/auth"

export async function handler(evt: any) {
  const session = Session.verify(
    Buffer.from(evt.protocolData.mqtt.password, "base64").toString()
  )
  provideActor(session as any)
  return assertHost()
    .then(() => ({
      isAuthenticated: true, //A Boolean that determines whether client can connect.
      principalId: Date.now().toString(), //A string that identifies the connection in logs.
      disconnectAfterInSeconds: 86400,
      refreshAfterInSeconds: 300,
      policyDocuments: [
        {
          Version: "2012-10-17",
          Statement: [
            {
              Action: "iot:Publish",
              Effect: "Allow",
              Resource: "*",
            },
            {
              Action: "iot:Connect",
              Effect: "Allow",
              Resource: "*",
            },
            {
              Action: "iot:Receive",
              Effect: "Allow",
              Resource: `arn:aws:iot:us-east-1:${process.env.ACCOUNT}:topic/*`,
            },
            {
              Action: "iot:Subscribe",
              Effect: "Allow",
              Resource: `arn:aws:iot:us-east-1:${process.env.ACCOUNT}:topicfilter/*`,
            },
          ],
        },
      ],
    }))
    .catch(() => ({
      isAuthenticated: false,
    }))
}
