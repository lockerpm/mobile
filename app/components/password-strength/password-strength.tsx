import * as React from "react"
import { observer } from "mobx-react-lite"
import { color } from "../../theme"
import { Text } from "../"
import { Progress, Box } from "native-base"
import { StyleProp, ViewStyle } from "react-native"


export interface PasswordStrengthProps {
  style?: StyleProp<ViewStyle>
  value: number,
}

/**
 * Describe your component here
 */
export const PasswordStrength = observer(function PasswordStrength(props: PasswordStrengthProps) {
  const { value, style } = props

  const config = {
    '-1': {
      text: '',
      color: 'primary'
    },
    0: {
      text: 'Very weak',
      color: 'csError'
    },
    1: {
      text: 'Weak',
      color: 'orange'
    },
    2: {
      text: 'Medium',
      color: 'yellow'
    },
    3: {
      text: 'Good',
      color: 'lightblue'
    },
    4: {
      text: 'Strong',
      color: 'csGreen'
    }
  }

  return (
    <Box w="100%" style={style}>
      <Progress
        size="lg"
        colorScheme={config[value].color}
        bg={color.block}
        max={5}
        value={value + 1}
      >
        <Text
          text={config[value].text}
          style={{
            fontSize: 8,
            color: color.palette.white
          }}
        />
      </Progress>
    </Box>
  )
})
