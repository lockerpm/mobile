import { Icon, Text } from "app/components/cores"
import { useAppLocale, useTheme } from "app/services/context"
import React from "react"
import { StyleSheet, View } from "react-native"

type Props = {
  // Trash screen header
  isTrash?: boolean
  /**
   * Show other actions if selected items are more than 0
   */
  selectedCount: number
  /**
   * User press X icon
   */
  onClose?: () => void
  /**
   * User press share icon
   */
  onShare?: () => void
  /**
   * User press check icon
   */
  onSelectAll?: () => void
  /**
   * User press folder icon
   */
  onMoveFolder?: () => void
  /**
   * User press restore icon
   */
  onRestore?: () => void
  /**
   * User press trash icon
   */
  onDelete?: () => void
}

export const CipherListSelectionHeader = ({
  isTrash,
  selectedCount,
  onClose,
  // onShare,
  onSelectAll,
  onMoveFolder,
  onRestore,
  onDelete,
}: Props) => {
  const { colors } = useTheme()
  const { translate } = useAppLocale()

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <Icon icon="x" color={colors.primaryText} onPress={onClose} />
        <Text
          preset="bold"
          text={
            selectedCount
              ? `${selectedCount} ${translate("common.selected")}`
              : translate("common.select")
          }
          style={{
            marginLeft: 8,
          }}
        />
      </View>
      <View style={styles.rowContainer}>
        <Icon icon="check-bold" onPress={onSelectAll} containerStyle={styles.iconContainer} />
        {selectedCount > 0 && (
          <>
            {/* {!isTrash && (
              <Icon icon="share" onPress={onShare} containerStyle={styles.iconContainer} />
            )} */}
            {!isTrash && (
              <Icon
                icon="folder-simple"
                onPress={onMoveFolder}
                containerStyle={styles.iconContainer}
              />
            )}

            {isTrash && (
              <Icon
                icon="repeat"
                onPress={onRestore}
                containerStyle={styles.iconContainer}
                color={colors.title}
              />
            )}
            <Icon
              icon="trash"
              color={colors.error}
              onPress={onDelete}
              containerStyle={styles.iconContainer}
            />
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconContainer: {
    padding: 8,
  },
  rowContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
})
