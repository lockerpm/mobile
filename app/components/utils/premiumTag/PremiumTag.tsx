import { useTheme } from 'app/services/context'
import React from 'react'
import { View } from 'react-native'
import { Text } from '../../cores'

export const PremiumTag = () => {
  const { colors } = useTheme()
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 2,
        backgroundColor: colors.primaryText,
        borderRadius: 3,
      }}
    >
      <Text text="PREMIUM" preset="bold" size="small" color={colors.background} />
    </View>
  )
}
