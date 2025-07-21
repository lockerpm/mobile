import { memo } from "react"
import { View, TouchableOpacity, StyleSheet } from "react-native"
import { Checkbox, Icon, Text } from "../../cores"
import { CipherAppView } from "app/static/types"
import { CipherIconImage } from "./CipherIconImage"
import { getCipherDescription } from "app/utils/cipherHelper"

type Prop = {
  /**
   * Cipher item to display
   */
  item: CipherAppView
  /**
   * Whether the item is selected
   */
  isSelected: boolean
  /**
   * item is shared with user
   */
  isShared: boolean
  /**
   * Whether the list is in selecting mode
   */
  isSelecting: boolean
  /**
   * select or deselect item
   */
  toggleItemSelection?: (item: CipherAppView) => void
  /**
   * Open item actions menu screen
   */
  openActionMenu: (item: CipherAppView) => void
}

export const CipherListItem = memo(
  ({ item, isSelecting, toggleItemSelection, openActionMenu, isSelected, isShared }: Prop) => {
    const description = getCipherDescription(item)

    const onPress = () => {
      if (isSelecting && toggleItemSelection) {
        toggleItemSelection(item)
      } else {
        openActionMenu(item)
      }
    }
    const longPress = () => {
      if (!isSelecting && toggleItemSelection) {
        toggleItemSelection(item)
      }
    }

    return (
      <TouchableOpacity onPress={onPress} onLongPress={longPress}>
        <View style={styles.container}>
          <CipherIconImage cipherType={item.type} source={item.imgLogo} style={styles.image} />

          <View style={styles.content}>
            {/* Name */}
            <Text preset="bold" numberOfLines={1} text={item.name} />

            {!!description && (
              <Text preset="label" size="sm" text={description} numberOfLines={1} />
            )}
          </View>

          {/* Belong to team icon */}
          {isShared && <Icon icon="users-three" size={22} containerStyle={styles.ml12} />}

          {/* Not sync icon */}
          {item.notSync && <Icon icon="wifi-slash" size={22} containerStyle={styles.ml12} />}

          {isSelecting && <Checkbox value={isSelected} containerStyle={styles.ml12} />}
        </View>
      </TouchableOpacity>
    )
  },
  (prev, next) =>
    prev.isSelecting === next.isSelecting &&
    prev.isSelected === next.isSelected &&
    prev.toggleItemSelection === next.toggleItemSelection
)

CipherListItem.displayName = "CipherListItem"

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    height: 70.5,
    paddingHorizontal: 20,
    paddingVertical: 12,
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
