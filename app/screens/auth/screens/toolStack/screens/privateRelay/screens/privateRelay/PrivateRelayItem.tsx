import { memo } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"

import { Icon, PressableIcon, PressableScale, Text } from "app/components/cores"
import { RelayAddress } from "app/static/types"

import { ThemedStyle } from "@/theme"
import { formatDate } from "@/utils/formatDate"
import { useAppTheme } from "@/utils/useAppTheme"

interface Props {
  item: RelayAddress
  isEditable: boolean
  isFirst?: boolean
  isLast?: boolean
  onPress: (item: RelayAddress, isEditable: boolean) => void
  onEdit: (item: RelayAddress) => void
}

export const AliasItem = memo(({ item, isEditable, isFirst, isLast, onPress, onEdit }: Props) => {
  const { themed } = useAppTheme()
  const subtitle = item.description?.trim() || formatDate(item.created_time * 1000, "dd/MM/yyyy")

  return (
    <PressableScale onPress={() => onPress(item, isEditable)}>
      <View
        style={[themed($container), isFirst && styles.topRadius, isLast && styles.bottomRadius]}
      >
        <View style={styles.content}>
          <Text numberOfLines={1} preset="bold" text={item.full_address} style={styles.mb4} />
          <Text preset="label" size="xs" numberOfLines={1} text={subtitle} />
        </View>
        {isEditable && (
          <PressableIcon icon="edit" size={24} style={styles.mr12} onPress={() => onEdit(item)} />
        )}
        <Icon icon="dots-three-vertical" size={24} />
      </View>
    </PressableScale>
  )
})

AliasItem.displayName = "AliasItem"

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  alignItems: "center",
  backgroundColor: colors.background,
  flexDirection: "row",
  marginHorizontal: 16,
  paddingHorizontal: 16,
  paddingVertical: 12,
})

const styles = StyleSheet.create({
  bottomRadius: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  mb4: { marginBottom: 4 },
  mr12: { marginRight: 12 },
  topRadius: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
})
