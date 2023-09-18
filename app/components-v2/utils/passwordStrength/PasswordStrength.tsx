import * as React from 'react'
import { Icon, IconTypes, Text } from '../../cores'
import { StyleProp, ViewStyle, View, ColorValue } from 'react-native'
import ProgressBar from 'react-native-ui-lib/progressBar'
import { useTheme } from 'app/services/context'
import { translate } from 'app/i18n'

export interface PasswordStrengthProps {
  style?: StyleProp<ViewStyle>
  value: number
  preset?: 'progress' | 'text'
}

/**
 * Describe your component here
 */
export const PasswordStrength = function PasswordStrength(props: PasswordStrengthProps) {
  const { value, style, preset = 'progress' } = props
  const { colors } = useTheme()

  const config: {
    [name: string]: {
      text: string
      color: ColorValue
      icon?: IconTypes
      isFill?: boolean
    }
  } = {
    '-1': {
      text: '',
      color: colors.primary,
    },
    0: {
      text: translate('password_strength.very_weak'),
      color: colors.error,
      icon: 'shield',
    },
    1: {
      text: translate('password_strength.weak'),
      color: colors.error,
      icon: 'shield',
    },
    2: {
      text: translate('password_strength.medium'),
      color: colors.palette.orange1,
      icon: 'shield',
      isFill: true,
    },
    3: {
      text: translate('password_strength.good'),
      color: colors.primary,
      icon: 'shield-check',
    },
    4: {
      text: translate('password_strength.strong'),
      color: colors.primary,
      icon: 'shield-check',
      isFill: true,
    },
  }

  return (
    <View style={[{ width: '100%' }, style]}>
      {preset === 'progress' && (
        <ProgressBar
          height={8}
          containerStyle={{
            borderRadius: 4,
          }}
          progressBackgroundColor={colors.block}
          backgroundColor={config[value]?.color}
          // @ts-ignore
          progress={((value + 1) / 5) * 100}
        />
      )}

      <Text
        size="small"
        style={{
          marginTop: 5,
          color: config[value]?.color,
        }}
      >
        <Icon
          filled={config[value]?.isFill}
          icon={config[value]?.icon}
          size={14}
          color={config[value]?.color}
        />
        {' ' + config[value]?.text}
      </Text>
    </View>
  )
}
