import { Icon, Text } from "app/components/cores"
import { useAppLocale, useTheme } from "app/services/context"
import React from "react"
import { StyleSheet, View } from "react-native"
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated"

type Props = {
  /**
   * Enable or disable share button
   */
  isFreeAccount: boolean
  /**
   * Show other actions if selected items are more than 0
   */
  selectedCipherIds: string[]
  /**
   * User press X icon
   */
  onClose: () => void
  /**
   * User press share icon
   */
  onShare: () => void
  /**
   * User press check icon
   */
  onSelectAll: () => void
  /**
   * User press folder icon
   */
  onMoveFolder: () => void
  /**
   * User press trash icon
   */
  onDelete: () => void
}

export const CipherListSelectionHeader = ({
  isFreeAccount,
  selectedCipherIds,
  onClose,
  onShare,
  onSelectAll,
  onMoveFolder,
  onDelete,
}: Props) => {
  const { colors } = useTheme()
  const { translate } = useAppLocale()

  return (
    <Animated.View entering={FadeInDown} exiting={FadeOutUp} style={styles.container}>
      <View style={styles.rowContainer}>
        <Icon icon="x" color={colors.primaryText} onPress={onClose} />
        <Text
          preset="bold"
          text={
            selectedCipherIds.length
              ? `${selectedCipherIds.length} ${translate("common.selected")}`
              : translate("common.select")
          }
          style={{
            marginLeft: 8,
          }}
        />
      </View>
      <View style={styles.rowContainer}>
        <Icon icon="check-bold" onPress={onSelectAll} containerStyle={styles.iconContainer} />
        {selectedCipherIds.length > 0 && (
          <>
            {!isFreeAccount && (
              <Icon icon="share" onPress={onShare} containerStyle={styles.iconContainer} />
            )}
            <Icon
              icon="folder-simple"
              onPress={onMoveFolder}
              containerStyle={styles.iconContainer}
            />
            <Icon
              icon="trash"
              color={colors.error}
              onPress={onDelete}
              containerStyle={styles.iconContainer}
            />
          </>
        )}
      </View>
    </Animated.View>
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
