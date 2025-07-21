import { memo } from "react"
import { View, StyleSheet } from "react-native"
import { CipherAppView } from "app/static/types"
import { getCipherDescription } from "app/utils/cipherHelper"
import { Icon, PressableIcon, Text } from "@/components/cores"
import { CipherIconImage } from "@/components/ciphers"
import { useAppTheme } from "@/utils/useAppTheme"

type Prop = {
  /**
   * Cipher item to display
   */
  item: CipherAppView
  /**
   * item is shared with user
   */
  isShared: boolean
  /**
   * Remove item
   */
  onRemove: (item: CipherAppView) => void
}

export const ShareCipher = memo(({ item, isShared, onRemove }: Prop) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const description = getCipherDescription(item)

  return (
    <View style={styles.container}>
      <CipherIconImage cipherType={item.type} source={item.imgLogo} style={styles.image} />

      <View style={styles.content}>
        {/* Name */}
        <Text preset="bold" numberOfLines={1} text={item.name} />

        {!!description && <Text preset="label" size="sm" text={description} numberOfLines={1} />}
      </View>

      {/* Belong to team icon */}
      {isShared && <Icon icon="users-three" size={22} containerStyle={styles.ml12} />}

      {onRemove && (
        <PressableIcon
          size={20}
          onPress={() => onRemove(item)}
          containerStyle={styles.ml12}
          icon={"trash"}
          color={colors.error}
        />
      )}
    </View>
  )
})

ShareCipher.displayName = "ShareCipher"

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: 12,
  },
  image: {
    borderRadius: 8,
    height: 40,
    width: 40,
  },
  ml12: {
    marginLeft: 12,
  },
})
