import { StyleProp, TextStyle, ViewStyle, StyleSheet } from "react-native"
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from "react-native-reanimated"
import { Text, TextProps } from "app/components/cores"
import { useAppTheme } from "@/utils/useAppTheme"

interface Props {
  style?: StyleProp<ViewStyle>
  animIndex: Animated.SharedValue<number>
}

type IntroType = {
  title: TextProps["tx"]
  desc: TextProps["tx"]
}

export const TITLE_HEIGHT = 90

export const AnimatedTitle = ({ style, animIndex }: Props) => {
  const intros: IntroType[] = [
    {
      title: "intro:security.title",
      desc: "intro:security.desc",
    },
    {
      title: "intro:sync.title",
      desc: "intro:sync.desc",
    },
    {
      title: "intro:autofill.title",
      desc: "intro:autofill.desc",
    },
    {
      title: "intro:otp.title",
      desc: "intro:otp.desc",
    },
  ]

  const $titleAnim = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            animIndex.value,
            [0, 1, 2, 3],
            [0, -TITLE_HEIGHT, -TITLE_HEIGHT * 2, -TITLE_HEIGHT * 3]
          ),
        },
      ],
    }
  })

  return (
    <Animated.View style={[styles.container, style]}>
      <Animated.View style={$titleAnim}>
        {intros.map((intro, index) => (
          <AnimatedTitleContent key={index} {...{ index, intro, animIndex }} />
        ))}
      </Animated.View>
    </Animated.View>
  )
}

interface ContentProps {
  intro: IntroType
  index: number
  animIndex: Animated.SharedValue<number>
}
const AnimatedTitleContent = ({ index, intro, animIndex }: ContentProps) => {
  const { theme } = useAppTheme()
  const $contentStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        animIndex.value,
        [index - 0.5, index, index + 0.35],
        [0, 1, 0],
        Extrapolate.CLAMP
      ),
    }
  })
  return (
    <Animated.View style={[styles.titleContent, $contentStyle]}>
      <Text
        preset="bold"
        tx={intro.title}
        size="xxl"
        style={$centerText}
        color={theme.colors.black}
      />
      <Text tx={intro.desc} style={$centerText} color={theme.colors.black} />
    </Animated.View>
  )
}

const $centerText: TextStyle = {
  textAlign: "center",
  marginTop: 4,
}

const styles = StyleSheet.create({
  container: {
    height: TITLE_HEIGHT + 40,
    overflow: "hidden",
    paddingBottom: 20,
    paddingTop: 20,
  },
  titleContent: {
    alignItems: "center",
    height: TITLE_HEIGHT,
  },
})
