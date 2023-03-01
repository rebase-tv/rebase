import { StackContext } from "sst/constructs"
import { Channel, PlaybackKeyPair } from "@aws-cdk/aws-ivs-alpha"
import { Secret } from "aws-cdk-lib/aws-secretsmanager"

export function Stream({ stack }: StackContext) {
  const channel = new Channel(stack, "channel", { authorized: true })
  const streamKey = channel.addStreamKey("primary")

  const keyPair = new PlaybackKeyPair(stack, "playback-key-pair", {
    publicKeyMaterial: `-----BEGIN PUBLIC KEY-----
MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEgV4GwqVRk67xDXtoCN7rAk8QmPofExpK
MgnsxnGgx6uq0XCSR6K0xCSH2uCNdEMVNZPiGjBFCf51EFWpvXCtKMTJo0SA4XpA
3VsUsL2HpxZsU7WBkBRgPPdMFTKBx/SZ
-----END PUBLIC KEY-----
`,
  })
  const secret = new Secret(stack, "private-key")

  stack.addOutputs({
    StreamKey: streamKey.streamKeyValue,
    SecretArn: secret.secretArn,
  })

  return { channel, streamKey, keyPair, secret }
}
