import { memo } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"

import { Text, PressableScale, Icon } from "app/components/cores"
import { colorTransparency } from "app/theme"

import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

import { SectionHeader } from "./SectionHeader"

interface ItemProps {
  email: string
  onPress: () => void
}

export const RootEmailInfo = memo(({ onPress, email }: ItemProps) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <View>
      <SectionHeader tx="private_relay:root_email" />
      <PressableScale onPress={onPress} style={themed($card)}>
        <View style={styles.content}>
          <Icon
            icon="mailbox-fill"
            size={24}
            color={colors.primary}
            containerStyle={themed($iconContainer)}
          />
          <Text preset="bold" text={email} style={styles.text} />
          <Icon icon="info" size={24} color={colorTransparency(colors.link, 50)} />
        </View>
      </PressableScale>
    </View>
  )
})

RootEmailInfo.displayName = "RootEmailInfo"

export const $card: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderRadius: 16,
  marginHorizontal: 16,
  paddingHorizontal: 16,
  paddingVertical: 12,
})

export const $iconContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colorTransparency(colors.primary, 20),
  borderRadius: 24,
  padding: 8,
})

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    flexDirection: "row",
  },
  text: {
    flex: 1,
    marginHorizontal: 12,
  },
})
