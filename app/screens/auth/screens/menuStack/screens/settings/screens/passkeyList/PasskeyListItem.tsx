import { StyleSheet, View, ViewStyle } from "react-native"

import { ImageIcon, PressableIcon, Text } from "app/components/cores"
import { PasskeyItem } from "app/static/types"

import { useAppLocale } from "@/i18n"
import { ThemedStyle } from "@/theme"
import { formatDate } from "@/utils/formatDate"
import { useAppTheme } from "@/utils/useAppTheme"

interface Props {
  isFirst?: boolean
  isLast?: boolean
  item: PasskeyItem
  onDelete: (item: PasskeyItem) => void
}

export const PasskeyListItem = ({ item, onDelete, isFirst, isLast }: Props) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()

  return (
    <View style={[themed($container), isFirst && styles.topBorder, isLast && styles.bottomBorder]}>
      <ImageIcon icon="keychain" size={40} />

      <View style={styles.content}>
        <View style={styles.row}>
          <Text
            preset="bold"
            numberOfLines={1}
            text={item.name || translate("passkey:unlock.unnamed")}
            style={styles.name}
          />
          {item.isPrimary && (
            <View style={themed($tag)}>
              <Text size="xxs" color={colors.primary} tx="passkey:unlock.primary" />
            </View>
          )}
        </View>
        {!!item.creationDate && (
          <Text
            preset="label"
            size="xs"
            text={
              translate("common:createdAt") +
              formatDate(item.creationDate * 1000, "MMM dd, yyyy HH:mm")
            }
          />
        )}
      </View>

      <PressableIcon icon="trash" size={20} color={colors.error} onPress={() => onDelete(item)} />
    </View>
  )
}

const $tag: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.primary,
  borderRadius: 4,
  borderWidth: 1,
  marginLeft: 8,
  paddingHorizontal: 6,
})

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  alignItems: "center",
  flexDirection: "row",
  paddingHorizontal: 16,
  paddingVertical: 12,
  marginHorizontal: 16,
})

const styles = StyleSheet.create({
  bottomBorder: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    marginHorizontal: 12,
  },
  name: {
    flexShrink: 1,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  topBorder: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
})
