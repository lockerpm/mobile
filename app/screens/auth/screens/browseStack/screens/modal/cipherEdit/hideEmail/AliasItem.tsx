import { StyleSheet, View, ViewStyle } from "react-native"
import { RelayAddress } from "app/static/types"
import { PressableScale, Text } from "app/components/cores"
import Animated, { FadeInUp } from "react-native-reanimated"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { formatDate } from "@/utils/formatDate"
import { memo } from "react"

interface Props {
  item: RelayAddress
  onSelect: (item: RelayAddress) => void
}

export const AliasItem = memo(({ item, onSelect }: Props) => {
  const { themed } = useAppTheme()
  return (
    <PressableScale
      onPress={() => {
        onSelect(item)
      }}
    >
      <Animated.View entering={FadeInUp} style={themed($container)}>
        <View style={styles.row}>
          <View style={styles.flexGrow}>
            <Text numberOfLines={1} preset="bold" text={item.full_address} style={styles.mb4} />
            <Text size="sm" text={formatDate(item.created_time * 1000)} />
          </View>
        </View>
      </Animated.View>
    </PressableScale>
  )
})

AliasItem.displayName = "AliasItem"

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 16,
  borderWidth: 1,
  marginVertical: 8,
  padding: 12,
  paddingVertical: 8,
  borderColor: colors.border,
})

const styles = StyleSheet.create({
  flexGrow: {
    flexGrow: 1,
    flexShrink: 1,
  },
  mb4: { marginBottom: 4 },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
})
