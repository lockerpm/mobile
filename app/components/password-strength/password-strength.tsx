import * as React from "react"
import { observer } from "mobx-react-lite"
import { color } from "../../theme"
import { Text } from "../"
import { Progress, Box } from "native-base"
import { StyleProp, ViewStyle } from "react-native"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'


export interface PasswordStrengthProps {
  style?: StyleProp<ViewStyle>
  value: number,
  preset?: 'progress' | 'text'
}

/**
 * Describe your component here
 */
export const PasswordStrength = observer(function PasswordStrength(props: PasswordStrengthProps) {
  const { value, style, preset = 'progress' } = props

  const config = {
    '-1': {
      text: '',
      color: 'primary'
    },
    0: {
      text: 'Very weak',
      color: 'csError',
      textColor: color.error,
      icon: 'shield-outline'
    },
    1: {
      text: 'Weak',
      color: 'csError',
      textColor: color.error,
      icon: 'shield-outline'
    },
    2: {
      text: 'Medium',
      color: 'yellow',
      icon: 'shield'
    },
    3: {
      text: 'Good',
      color: 'csGreen',
      textColor: color.palette.green,
      icon: 'shield-checkmark-outline'
    },
    4: {
      text: 'Strong',
      color: 'csGreen',
      textColor: color.palette.green,
      icon: 'shield-checkmark'
    }
  }

  return (
    <Box w="100%" style={style}>
      {
        preset === 'progress' ? (
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
        ) : (
          <Text
            style={{
              marginTop: 5,
              fontSize: 12,
              color: config[value].textColor || config[value].color
            }}
          >
            <IoniconsIcon
              name={config[value].icon}
              size={14}
              color={config[value].textColor || config[value].color}
            />
            {' ' + config[value].text}
          </Text>
        )
      }
    </Box>
  )
})
