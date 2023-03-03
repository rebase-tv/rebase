import { Config, StackContext } from "sst/constructs"
import { Channel, PlaybackKeyPair } from "@aws-cdk/aws-ivs-alpha"

export function Stream({ stack }: StackContext) {
  const channel = new Channel(stack, "channel", { authorized: true })
  const streamKey = channel.addStreamKey("primary")

  if (stack.stage === "production" || stack.stage === "dev") {
    new PlaybackKeyPair(stack, "playback-key-pair", {
      publicKeyMaterial: `-----BEGIN PUBLIC KEY-----
MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEgV4GwqVRk67xDXtoCN7rAk8QmPofExpK
MgnsxnGgx6uq0XCSR6K0xCSH2uCNdEMVNZPiGjBFCf51EFWpvXCtKMTJo0SA4XpA
3VsUsL2HpxZsU7WBkBRgPPdMFTKBx/SZ
-----END PUBLIC KEY-----
`,
    })
  }
  const config = {
    ...Config.Parameter.create(stack, {
      STREAM_CHANNEL_ARN: channel.channelArn,
      STREAM_CHANNEL_URL: channel.channelPlaybackUrl,
    }),
    ...Config.Secret.create(stack, "STREAM_PRIVATE_KEY"),
  }

  stack.addOutputs({
    ChannelEndpoint: `rtmps://${channel.channelIngestEndpoint}/app/`,
    StreamKey: streamKey.streamKeyValue,
  })

  return config
}
