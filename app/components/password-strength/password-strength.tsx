import * as React from "react"
import { observer } from "mobx-react-lite"
import { color, fontSize } from "../../theme"
import { Text } from "../text/text"
import { StyleProp, ViewStyle, View } from "react-native"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import ProgressBar from "react-native-ui-lib/progressBar"
import { useMixins } from "../../services/mixins"


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
  const { translate } = useMixins()

  const config = {
    '-1': {
      text: '',
      color: 'primary'
    },
    0: {
      text: translate('password_strength.very_weak'),
      color: color.error,
      textColor: color.error,
      icon: 'shield-outline'
    },
    1: {
      text: translate('password_strength.weak'),
      color: color.error,
      textColor: color.error,
      icon: 'shield-outline'
    },
    2: {
      text: translate('password_strength.medium'),
      color: 'orange',
      textColor: 'orange',
      icon: 'shield'
    },
    3: {
      text: translate('password_strength.good'),
      color: color.palette.green,
      textColor: color.palette.green,
      icon: 'shield-checkmark-outline'
    },
    4: {
      text: translate('password_strength.strong'),
      color: color.palette.green,
      textColor: color.palette.green,
      icon: 'shield-checkmark'
    }
  }

  return (
    <View style={[{ width: '100%' }, style]}>
      {
        preset === 'progress' && (
          <ProgressBar
            height={8}
            containerStyle={{
              borderRadius: 4
            }}
            progressBackgroundColor={color.block}
            backgroundColor={config[value].color}
            progress={(value + 1) / 5 * 100}
          >
            <Text
              text={config[value].text}
              style={{
                fontSize: fontSize.mini,
                color: color.palette.white
              }}
            />
          </ProgressBar>
        )
      }

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
    </View>
  )
})
