import React from "react"
import { TextProps, Text } from "./Text"
import { TouchableOpacity } from "react-native"

interface TouchableTextProps extends TextProps {
  onPress: () => void
}

export const TouchableText = ({ onPress, ...textProps }: TouchableTextProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text {...textProps} />
    </TouchableOpacity>
  )
}
