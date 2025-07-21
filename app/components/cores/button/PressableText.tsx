import { TextProps, Text } from "../text/Text"
import { TouchableOpacity, ViewProps } from "react-native"

interface TouchableTextProps extends TextProps {
  onPress: () => void
  containerStyle?: ViewProps["style"]
}

export const PressableText = ({ onPress, containerStyle, ...textProps }: TouchableTextProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={containerStyle}>
      <Text {...textProps} />
    </TouchableOpacity>
  )
}
