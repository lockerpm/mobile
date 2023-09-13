import React, { useEffect } from 'react'
import { View, Dimensions, StyleProp, ViewStyle } from 'react-native'
import Svg, { Color, Path } from 'react-native-svg'
import Animated, {
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { mix } from 'react-native-redash'
import { useTheme } from 'app/services/context'

const AnimatedPath = Animated.createAnimatedComponent(Path)

interface Props {
  style?: StyleProp<ViewStyle>
  color: Color
}

export const Wave = ({ style, color }: Props) => {
  const { colors } = useTheme()
  const { width, height } = Dimensions.get('window')
  const progress = useSharedValue(0)
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    )
  }, [progress])
  const data1 = useDerivedValue(() => {
    const m = mix.bind(null, progress.value)
    return {
      from: {
        x: m(-0.1, -1),
        y: m(0.2, 0.3),
      },
      c1: { x: m(0, 0.5), y: m(0.7, 1) },
      c2: { x: m(1, 0.5), y: m(0.3, 0) },
      to: { x: m(1.1, 2), y: m(0.8, 0.5) },
    }
  })

  const path1 = useAnimatedProps(() => {
    const { from, c1, c2, to } = data1.value
    return {
      d: `M ${from.x} ${from.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${to.x} ${to.y} L 1 2 L 0 2 Z`,
    }
  })

  const data2 = useDerivedValue(() => {
    const m = mix.bind(null, 1 - progress.value)
    return {
      from: {
        x: m(-0.3, -1),
        y: m(0, 0.3),
      },
      c1: { x: m(-0.1, 0.5), y: m(0.2, 1) },
      c2: { x: m(0.6, 0.5), y: m(0.1, 0) },
      to: { x: m(0.8, 2), y: m(0.4, 0.5) },
    }
  })

  const path2 = useAnimatedProps(() => {
    const { from, c1, c2, to } = data2.value
    return {
      d: `M ${from.x} ${from.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${to.x} ${to.y} L 1 2 L 0 2 Z`,
    }
  })

  return (
    <View
      style={[
        {
          width: width,
          height: height,
          justifyContent: 'flex-end',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Svg
        width={width}
        height={height - 120}
        style={{ backgroundColor: colors.transparent }}
        viewBox="0 0 1 1"
      >
        <AnimatedPath fill={'#f2ffe6'} animatedProps={path2} />
        <AnimatedPath fill={color} animatedProps={path1} />
      </Svg>
    </View>
  )
}
