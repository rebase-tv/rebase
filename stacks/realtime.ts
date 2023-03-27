import { ServicePrincipal } from "aws-cdk-lib/aws-iam"
import { CfnAuthorizer, CfnTopicRule } from "aws-cdk-lib/aws-iot"
import { StackContext, Function, use } from "sst/constructs"
import { Auth } from "./auth"
import { Dynamo } from "./dynamo"
import { Secrets } from "./secrets"
import { Stream } from "./stream"

export function Realtime(ctx: StackContext) {
  const dynamo = use(Dynamo)
  const auth = use(Auth)
  const stream = use(Stream)
  const secrets = use(Secrets)

  const authorizerFn = new Function(ctx.stack, "authorizer-fn", {
    handler: "packages/functions/src/iot/auth.handler",
    bind: [dynamo, auth],
    permissions: ["iot"],
    environment: {
      ACCOUNT: ctx.app.account,
    },
  })

  const authorizer = new CfnAuthorizer(ctx.stack, "authorizer", {
    status: "ACTIVE",
    authorizerName: ctx.app.logicalPrefixedName("authorizer"),
    authorizerFunctionArn: authorizerFn.functionArn,
    signingDisabled: true,
  })

  authorizerFn.addPermission("IOTPermission", {
    principal: new ServicePrincipal("iot.amazonaws.com"),
    sourceArn: authorizer.attrArn,
    action: "lambda:InvokeFunction",
  })

  const topicHandler = new Function(ctx.stack, "iot-event-fn", {
    handler: "packages/functions/src/iot/event.handler",
    permissions: ["ivs"],
    bind: [stream.STREAM_CHANNEL_ARN, dynamo, secrets.AIRTABLE_TOKEN],
  })

  new CfnTopicRule(ctx.stack, "rule", {
    topicRulePayload: {
      sql: `SELECT * FROM 'rebase/${ctx.app.stage}/#'`,
      errorAction: {
        lambda: {
          functionArn: topicHandler.functionArn,
        },
      },
      actions: [
        {
          lambda: {
            functionArn: topicHandler.functionArn,
          },
        },
      ],
    },
  })
}
