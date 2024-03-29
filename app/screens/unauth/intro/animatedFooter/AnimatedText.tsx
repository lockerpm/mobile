import React from 'react'
import { StyleProp, TextStyle, ViewStyle } from 'react-native'
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from 'react-native-reanimated'
import { Text } from 'app/components/cores'
import { useHelper } from 'app/services/hook'

interface Props {
  style?: StyleProp<ViewStyle>
  animIndex: Animated.SharedValue<number>
}

export const TITLE_HEIGHT = 90

export const AnimatedTitle = ({ style, animIndex }: Props) => {
  const { translate } = useHelper()
  const intros = [
    {
      title: translate('intro.security.title'),
      desc: translate('intro.security.desc'),
    },
    {
      title: translate('intro.sync.title'),
      desc: translate('intro.sync.desc'),
    },
    {
      title: translate('intro.autofill.title'),
      desc: translate('intro.autofill.desc'),
    },
    {
      title: translate('intro.otp.title'),
      desc: translate('intro.otp.desc'),
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
    <Animated.View
      style={[
        {
          height: TITLE_HEIGHT + 40,
          paddingTop: 20,
          paddingBottom: 20,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={$titleAnim}>
        {intros.map((intro, index) => (
          <AnimatedTitleContent key={index} {...{ index, intro, animIndex }} />
        ))}
      </Animated.View>
    </Animated.View>
  )
}

interface ContentProps {
  intro: { title: string; desc: string }
  index: number
  animIndex: Animated.SharedValue<number>
}
const AnimatedTitleContent = ({ index, intro, animIndex }: ContentProps) => {
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
    <Animated.View
      style={[
        {
          height: TITLE_HEIGHT,
          alignItems: 'center',
        },
        $contentStyle,
      ]}
    >
      <Text preset="bold" text={intro.title} size="xxl" style={$centerText} />
      <Text text={intro.desc} style={[$centerText, { marginTop: 4 }]} />
    </Animated.View>
  )
}

const $centerText: TextStyle = {
  textAlign: 'center',
}
