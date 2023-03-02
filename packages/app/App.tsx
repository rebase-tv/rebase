import { Text, View } from "react-native"
import IVSPlayer from "amazon-ivs-react-native-player"
import Constants from "expo-constants"
import { useEffect, useState } from "react"

const getStreamUrl = async () => {
  const playbackUrl = await fetch(
    `${Constants.expoConfig.extra?.apiUrl}/stream`
  )
  const { streamUrl } = (await playbackUrl.json()) as { streamUrl: string }
  return streamUrl
}

export default function App() {
  const [streamUrl, setStreamUrl] = useState("")
  useEffect(() => {
    async function init() {
      const url = await getStreamUrl()
      setStreamUrl(url)
    }
    init()
  }, [])

  return (
    <View className="flex-1 bg-white">
      <IVSPlayer autoplay streamUrl={streamUrl} />
    </View>
  )
}
