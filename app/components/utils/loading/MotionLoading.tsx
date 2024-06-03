import { Logo } from "app/components/cores"
import { useTheme } from "app/services/context"
import React, { useEffect } from "react"
import {  ColorValue, View } from "react-native"
import Animated, {
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"
import { Screen } from "react-native-screens"
import { Circle, Path, Svg } from "react-native-svg"

interface CircleProgressProps {
  size: number
  minValue?: number
  maxValue?: number
  strokeWidth?: number
  color: ColorValue
  centerProgress?: boolean
}

const AnimatedPath = Animated.createAnimatedComponent(Path)
const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const strokeWidth = 3

function polarToCartesian(angle: number, radius: number, center: Point) {
  "worklet"
  const a = ((angle - 90) * Math.PI) / 180
  return {
    x: center.x + radius * Math.cos(a),
    y: center.y + radius * Math.sin(a),
  }
}

function valueToAngle(value: number, min: number, max: number) {
  "worklet"
  return interpolate(value, [min, max], [0, 360])
}

type Point = {
  x: number
  y: number
}

export const CircleProgress = ({
  size,
  minValue = 0,
  maxValue = 100,
  color,
}: CircleProgressProps) => {
  const progress = useSharedValue(0)
  const back = useSharedValue(false)
  useEffect(() => {
    progress.value = withRepeat(withTiming(100, {duration: 1000}), -1, true)
  }, [])

  const r = size / 2 - strokeWidth / 2
  const center = {
    x: size / 2,
    y: size / 2,
  }
  const knobRadius = strokeWidth / 2
  const start = polarToCartesian(0, r, center)
  const angle = useDerivedValue(() => {
    if (progress.value === maxValue) {
      back.value = true
      return valueToAngle(99.9, minValue, maxValue)
    }
    if (progress.value === 0) { 
      back.value = false
    }
    return valueToAngle(progress.value, minValue, maxValue)
  }, [progress])

  const knobPosition = useDerivedValue(() => polarToCartesian(angle.value, r, center))

  const pathProps = useAnimatedProps(() => {
    const end = knobPosition.value
    return {
      d: `M ${start.x} ${start.y} A ${r} ${r} 0 ${angle.value > 180 ? 1 : 0} 1 ${end.x} ${end.y}`,
    }
  })

  const knobGProps = useAnimatedProps(() => {
    return {
      cx: knobPosition.value.x,
      cy: knobPosition.value.y,
    }
  })
  const container = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: "90deg"},
        { scaleX: back.value ? -1 : 1 }
      ]
    }
  }, [])
  return (
    <Animated.View style={container}>
      <Svg height={size} width={size}>
        <AnimatedPath
          fill={"none"}
          strokeWidth={strokeWidth}
          stroke={color}
          animatedProps={pathProps}
        />
        <AnimatedCircle animatedProps={knobGProps} r={knobRadius} fill={color} />
      </Svg>
    </Animated.View>
  )
}

export const MotionLoading = () => {
  const {colors} = useTheme()
  return (
    <Screen
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 150,
          height: 150,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircleProgress size={150} color={colors.primary}/>

        <Logo
          preset={"default"}
          style={{ height: 80, width: 80, marginBottom: 25, alignSelf: "center"}}
          containerStyle={{
            top: 37,
            position:"absolute" 
          }}
        />
      </View>
    </Screen>
  )
}
