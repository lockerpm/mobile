import * as React from "react"
import { observer } from "mobx-react-lite"
import { color, fontSize } from "../../theme"
import { Text } from "../text/text"
import { Progress, Box } from "native-base"
import { StyleProp, ViewStyle } from "react-native"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { translate } from "../../i18n"


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
      text: translate('password_strength.very_weak'),
      color: 'csError',
      textColor: color.error,
      icon: 'shield-outline'
    },
    1: {
      text: translate('password_strength.weak'),
      color: 'csError',
      textColor: color.error,
      icon: 'shield-outline'
    },
    2: {
      text: translate('password_strength.medium'),
      color: 'yellow',
      icon: 'shield'
    },
    3: {
      text: translate('password_strength.good'),
      color: 'csGreen',
      textColor: color.palette.green,
      icon: 'shield-checkmark-outline'
    },
    4: {
      text: translate('password_strength.strong'),
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
                fontSize: fontSize.mini,
                color: color.palette.white
              }}
            />
          </Progress>
        ) : (
          <Text
            style={{
              marginTop: 5,
              fontSize: fontSize.small,
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
