import { StatusBar } from "expo-status-bar"
import { Text, View } from "react-native"
// import IVSPlayer from "amazon-ivs-react-native-player"
import Constants from "expo-constants"
import { useEffect, useState } from "react"

const getStreamUrl = async () => {
  console.log(Constants.expoConfig.extra?.apiUrl)
  const playbackUrl = await fetch(
    `${Constants.expoConfig.extra?.apiUrl}/stream`
  )
  const value = await playbackUrl.json()
  console.log(value)
  return value
}

export default function App() {
  const [streamUrl, setStreamUrl] = useState("")
  console.log(streamUrl)
  useEffect(() => {
    async function init() {
      const url = await getStreamUrl()
      setStreamUrl(url)
    }
    init()
  }, [])

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text>Open up App.js to start working on your app!</Text>
      {/* <IVSPlayer autoplay streamUrl={streamUrl} /> */}
      <StatusBar style="auto" />
    </View>
  )
}
