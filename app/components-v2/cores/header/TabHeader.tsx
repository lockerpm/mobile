import React from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '../text/Text'
import { useTheme } from 'app/services/context'

interface Props {
  title: string
}

export const TabHeader = ({ title }: Props) => {
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: colors.background,
      }}
    >
      <View style={{ paddingHorizontal: 24, height: 56, justifyContent: 'center' }}>
        <Text preset="bold" size="xxl" weight="semibold" text={title} />
      </View>
    </View>
  )
}
