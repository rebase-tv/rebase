import { View, TouchableHighlight, Image, Text } from "react-native"
import IVSPlayer, {
  Quality,
  TextMetadataCue,
} from "amazon-ivs-react-native-player"
import Constants from "expo-constants"
import { useEffect, useState } from "react"
import Ionicons from "@expo/vector-icons/Ionicons"
import { styled } from "nativewind"
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  withDelay,
  interpolate,
} from "react-native-reanimated"
import MaskedView from "@react-native-masked-view/masked-view"
import { trpc, TRPCProvider } from "./data/trpc"

const StyledIonicons = styled(Ionicons)
const StyledTouchableHighlight = styled(TouchableHighlight)
const StyledIVSPlayer = styled(IVSPlayer)
const StyledMaskedView = styled(MaskedView)

const AnimatedMaskedView = Animated.createAnimatedComponent(StyledMaskedView)

const duration = 333

export default function App() {
  return (
    <TRPCProvider>
      <Screen />
    </TRPCProvider>
  )
}

function Screen() {
  const stream = trpc.stream_create.useQuery({})
  const [cue, setCue] = useState<TextMetadataCue>()
  const [qualities, setQualities] = useState<Quality[]>()
  const transition = useSharedValue(0)

  useEffect(() => {
    if (!cue) return

    transition.value = 1
    setTimeout(() => {
      setCue(undefined)
      transition.value = 0
    }, 1000 * 10)
  }, [cue, setCue])

  const handlePress = () => {}

  const hostAvatarStyles = useAnimatedStyle(() => {
    const scale = interpolate(transition.value, [0, 1], [3.3, 1])

    return {
      transform: [
        // { translateY: withTiming(0, { duration, easing: Easing.quad }) },
        {
          scale: withTiming(scale, {
            duration,
            easing: Easing.inOut(Easing.ease),
          }),
        },
      ],
    }
  })

  const hostMaskStyles = useAnimatedStyle(() => {
    const finalHeight = 96
    const height = interpolate(
      transition.value,
      [0, 1],
      [finalHeight * (1920 / 1080), finalHeight]
    )
    const borderRadius = interpolate(
      transition.value,
      [0, 1],
      [0, finalHeight / 2]
    )

    return {
      borderRadius: withTiming(borderRadius, {
        duration: duration * 0.9,
        easing: Easing.inOut(Easing.ease),
      }),
      height: withTiming(height, {
        duration: duration * 0.9,
        easing: Easing.inOut(Easing.ease),
      }),
    }
  })

  if (!stream.data) return null
  return (
    <StyledMaskedView
      className="relative flex-1 flex-row h-full"
      androidRenderingMode="software"
      maskElement={
        <View
          style={{
            // Transparent background because mask is based off alpha channel.
            backgroundColor: "transparent",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* <Animated.Image */}
          {/*   source={require("./assets/circle-mask.png")} */}
          {/*   className="w-full h-full object-cover" */}
          {/* /> */}
          <View className="w-full h-full bg-black" />
        </View>
      }
    >
      <IVSPlayer
        autoplay
        volume={0.1}
        streamUrl={stream.data.url}
        onData={(data) => setQualities(data.qualities)}
        onTextMetadataCue={setCue}
      >
        <View className="absolute inset-0" style={{ opacity: cue ? 1 : 0 }}>
          <View className="absolute inset-0 bg-navy/80" />
          <Animated.View
            // entering={SlideInUp.duration(500).easing(Easing.bounce)}
            className="absolute top-8 inset-x-2 bg-light rounded-2xl h-2/3 flex-1 items-center justify-center"
          >
            <View className="absolute top-0 inset-x-0">
              <AnimatedMaskedView
                // entering={entering}
                className="mt-5 w-24 aspect-[1080/1920] mx-auto overflow-clip"
                style={hostAvatarStyles}
                maskElement={
                  <View className="absolute inset-0 bg-transparent flex-1 justify-center items-center">
                    <Animated.View
                      // entering={maskEntering}
                      className="absolute inset-0 bg-black"
                      style={hostMaskStyles}
                    />
                  </View>
                }
              >
                <StyledIVSPlayer
                  autoplay
                  muted
                  streamUrl={stream.data.url}
                  onData={(data) => setQualities(data.qualities)}
                  onTextMetadataCue={setCue}
                  className="absolute inset-x-0 aspect-[1080/1920] object-cover bg-pink"
                />
              </AnimatedMaskedView>
            </View>
          </Animated.View>
        </View>
        <View className="absolute bottom-8 right-4">
          <StyledTouchableHighlight
            onPress={handlePress}
            className="bg-pink rounded-full w-12 h-12 flex items-center justify-center"
          >
            <StyledIonicons
              name="md-heart"
              size={24}
              color="white"
              className="ml-0 mt-1"
            />
          </StyledTouchableHighlight>
        </View>
      </IVSPlayer>
    </StyledMaskedView>
  )
}
