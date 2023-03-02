import { StatusBar } from "expo-status-bar"
import { Text, View } from "react-native"
import IVSPlayer from "amazon-ivs-react-native-player"
// import Constants from "expo-constants"
// import { useEffect, useState } from "react"

// const getStreamUrl = async () => {
//   console.log(Constants.expoConfig.extra?.apiUrl)
//   const playbackUrl = await fetch(
//     `${Constants.expoConfig.extra?.apiUrl}/stream`
//   )
//   const value = await playbackUrl.json()
//   console.log(value)
//   return value
// }

const streamUrl =
  "https://3460cdb84f2a.us-east-1.playback.live-video.net/api/video/v1/us-east-1.882123019309.channel.ma6xerWxNApH.m3u8?token=eyJhbGciOiJFUzM4NCIsInR5cCI6IkpXVCJ9.eyJhd3M6Y2hhbm5lbC1hcm4iOiJhcm46YXdzOml2czp1cy1lYXN0LTE6ODgyMTIzMDE5MzA5OmNoYW5uZWwvbWE2eGVyV3hOQXBIIiwiYXdzOmFjY2Vzcy1jb250cm9sLWFsbG93LW9yaWdpbiI6IioiLCJleHAiOjE2Nzc3Njc0MjIzMzYsImlhdCI6MTY3Nzc2MzgyMn0.tFsa9fv-0hwsCkBRdblHBbYik0b1CbMHfiFA0kEFY-1TSNkW207PX0aK9Kf8jkBdRLTG-RhqOSnveN_bhZvVdsRi-VxOsKWbPZvyfivrrPEFISqJtzTipIQIRc_bOokl"

export default function App() {
  // const [streamUrl, setStreamUrl] = useState("")
  // console.log(streamUrl)
  // useEffect(() => {
  //   async function init() {
  //     const url = await getStreamUrl()
  //     setStreamUrl(url)
  //   }
  //   init()
  // }, [])

  return (
    <View className="flex-1 bg-white">
      {/* <Text>Open up App.js to start working on your app!</Text> */}
      <IVSPlayer autoplay streamUrl={streamUrl} />
      {/* <StatusBar style="auto" /> */}
    </View>
  )
}
