import React, { useRef } from "react"
import { Pressable, Animated, PressableProps, StyleProp, ViewStyle } from "react-native"

interface Props extends PressableProps {
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  /**
   * Children components.
   */
  children?: React.ReactNode
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const PressableScale = ({ children, onPress, style }: Props) => {
  const scale = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      mass: 1,
      stiffness: 100,
      damping: 200,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      mass: 1,
      stiffness: 100,
      damping: 200,
      useNativeDriver: true,
    }).start()
  }

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  )
}
