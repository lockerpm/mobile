import React, { useEffect } from "react"
import { Dimensions, ImageSourcePropType, View, ViewStyle } from "react-native"
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"
import { withPause } from "react-native-redash"

const SCREEN_WIDTH = Dimensions.get("screen").width

const SCREEN_IMAGE = {
  SECURITY: require("../../../../../assets/img/onboard/security.png"),
  OTP: require("../../../../../assets/img/onboard/otp.png"),
  AUTOFILL: require("../../../../../assets/img/onboard/autofill.png"),
  SYNC: require("../../../../../assets/img/onboard/sync.png"),
}

interface Props {
  onView: boolean
}

const useAnimatedImageStyle = (onView: boolean, top: number, bottom: number, duration: number) => {
  const paused = useSharedValue(!onView)
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withPause(withRepeat(withTiming(1, { duration }), -1, true), paused)
  }, [paused])

  useEffect(() => {
    paused.value = !onView
  }, [onView])

  return useAnimatedStyle(() => {
    return {
      width: SCREEN_WIDTH,
      maxHeight: SCREEN_WIDTH,
      transform: [
        {
          translateY: interpolate(progress.value, [0, 1], [-top, bottom]),
        },
      ],
    }
  })
}

const $containerStyle: ViewStyle = {
  width: SCREEN_WIDTH,
  alignItems: "center",
  justifyContent: "space-between",
}

interface IntroWrapper {
  img: ImageSourcePropType
  top: number
  bottom: number
  duration: number
}

const Intro = ({ onView, img, top, bottom, duration }: Props & IntroWrapper) => {
  const $backgroundStyle = useAnimatedImageStyle(onView, top, bottom, duration)
  return (
    <View style={$containerStyle}>
      <Animated.Image source={img} resizeMode="contain" style={$backgroundStyle} />
    </View>
  )
}

export const Intro1 = ({ onView }: Props) => (
  <Intro onView={onView} img={SCREEN_IMAGE.SECURITY} top={5} bottom={5} duration={2000} />
)

export const Intro2 = ({ onView }: Props) => (
  <Intro onView={onView} img={SCREEN_IMAGE.SYNC} top={8} bottom={8} duration={1500} />
)

export const Intro3 = ({ onView }: Props) => (
  <Intro onView={onView} img={SCREEN_IMAGE.AUTOFILL} top={6} bottom={6} duration={1700} />
)

export const Intro4 = ({ onView }: Props) => (
  <Intro onView={onView} img={SCREEN_IMAGE.OTP} top={5} bottom={5} duration={1600} />
)
