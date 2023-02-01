import React, { useEffect } from "react"
import { Dimensions, StyleSheet, View } from "react-native"
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"
import { withPause } from "react-native-redash"
import { APP_INTRO } from "../../../../common/mappings"
import { AutoImage as Image } from "../../../../components"
import { ImageIcon } from "../../../../components/cores"

const SCREEN_WIDTH = Dimensions.get("screen").width

const SCREEN_IMAGE = {
  AUTH_BLANK: require("../../../../../assets/img/onboard/auth-blank.png"),
  AUTH_LOCKERIO: require("../../../../../assets/img/onboard/auth-lockerio.png"),
  AUTH_WEBSITE: require("../../../../../assets/img/onboard/auth-website.png"),
  AUTOFILL_WEB: require("../../../../../assets/img/onboard/autofill-web.png"),
  HOME_APP: require("../../../../../assets/img/onboard/home-app.png"),
  HOME_MOBILE: require("../../../../../assets/img/onboard/home-mobile.png"),
  HOME_WEB: require("../../../../../assets/img/onboard/home-web.png"),
}

interface Props {
  onView: boolean
}

export const Intro1 = ({ onView }: Props) => {
  const paused = useSharedValue(!onView)
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withPause(withRepeat(withTiming(1, { duration: 2000 }), -1, true), paused)
  }, [paused])

  useEffect(() => {
    paused.value = !onView
  }, [onView])

  const $passwordStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      top: 40,
      right: 20,
      transform: [
        {
          scale: interpolate(progress.value, [0, 1 / 3], [1, 1.2], Extrapolate.CLAMP),
        },
      ],
    }
  })
  const $walletStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      top: 130,
      left: 40,
      transform: [
        {
          scale: interpolate(progress.value, [1 / 3, 2 / 3], [1, 1.2], Extrapolate.CLAMP),
        },
      ],
    }
  })
  const $identityStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      bottom: 100,
      right: 40,
      transform: [
        {
          scale: interpolate(progress.value, [1 / 3, 1], [1, 1.2], Extrapolate.CLAMP),
        },
      ],
    }
  })
  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={$passwordStyle}>
          <ImageIcon icon="password" size={40} />
        </Animated.View>
        <Animated.View style={$walletStyle}>
          <ImageIcon icon="wallet" size={40} />
        </Animated.View>
        <Animated.View style={$identityStyle}>
          <ImageIcon icon="identification" size={40} />
        </Animated.View>
      </View>
      <Image
        source={SCREEN_IMAGE.HOME_APP}
        resizeMode="contain"
        style={{
          width: SCREEN_WIDTH,
          maxHeight: SCREEN_WIDTH,
        }}
      />
    </View>
  )
}

export const Intro2 = () => {
  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Image
        source={APP_INTRO.security}
        resizeMode="contain"
        style={{
          width: SCREEN_WIDTH,
          maxHeight: SCREEN_WIDTH,
        }}
      />
    </View>
  )
}

export const Intro3 = () => {
  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Image
        source={APP_INTRO.security}
        resizeMode="contain"
        style={{
          width: SCREEN_WIDTH,
          maxHeight: SCREEN_WIDTH,
        }}
      />
    </View>
  )
}

export const Intro4 = () => {
  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Image
        source={APP_INTRO.security}
        resizeMode="contain"
        style={{
          width: SCREEN_WIDTH,
          maxHeight: SCREEN_WIDTH,
        }}
      />
    </View>
  )
}
