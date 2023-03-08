import { Text, View } from "react-native"
import IVSPlayer from "amazon-ivs-react-native-player"
import { trpc, TRPCProvider } from "./data/trpc"

export default function App() {
  const stream = trpc.stream_create.useQuery({})

  return (
    <TRPCProvider>
      <View className="flex-1 bg-white">
        {stream.data && <IVSPlayer autoplay streamUrl={stream.data.url} />}
      </View>
    </TRPCProvider>
  )
}
