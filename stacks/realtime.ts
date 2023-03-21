import { ServicePrincipal } from "aws-cdk-lib/aws-iam"
import { CfnAuthorizer } from "aws-cdk-lib/aws-iot"
import { StackContext, Function, use } from "sst/constructs"
import { Auth } from "./auth"
import { Dynamo } from "./dynamo"

export function Realtime(ctx: StackContext) {
  const dynamo = use(Dynamo)
  const auth = use(Auth)
  const authorizerFn = new Function(ctx.stack, "authorizer-fn", {
    handler: "packages/functions/src/iot-auth.handler",
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
}
