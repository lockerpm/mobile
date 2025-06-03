import React from "react"
import { View, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Text } from "../text/Text"
import { useTheme } from "app/services/context"
import { TOptions, TxKeyPath } from "app/i18n"

interface Props {
  title?: string
  titleTx?: TxKeyPath
  titleOptions?: TOptions
}

export const TabHeader = ({ title, titleTx, titleOptions }: Props) => {
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()
  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: colors.background,
      }}
    >
      <View style={$container}>
        <Text
          preset="bold"
          size="xxl"
          weight="semibold"
          text={title}
          tx={titleTx}
          txOptions={titleOptions}
        />
      </View>
    </View>
  )
}

const $container: ViewStyle = {
  paddingHorizontal: 24,
  height: 56,
  justifyContent: "center",
}
