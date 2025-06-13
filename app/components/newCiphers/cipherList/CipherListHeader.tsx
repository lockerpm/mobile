import React from "react"
import { View, StyleSheet } from "react-native"
import { Icon, Text } from "app/components/cores"
import Animated, {
  FadeInDown,
  FadeOutDown,
  FadeOutUp,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"

import { TxKeyPath } from "app/i18n"
import { CipherListSelectionHeader } from "./CipherListSelectionHeader"

interface Props {
  /**
   * Trash screen header
   */
  isTrash?: boolean
  /**
   * Show Header title
   */
  header?: string
  headerTx?: TxKeyPath

  /**
   * Cipher List actions
   */
  openSort: () => void
  goBack: () => void

  openAdd?: () => void
  openMoveToFolder?: () => void
  openShare?: () => void
  openDelete?: () => void
  toggleSelectAll?: () => void
  handleRestore?: () => void
  clearSelect?: () => void
  selectedCount: number
  isSelecting: boolean
}

export const CipherListHeader = (props: Props) => {
  const {
    isTrash,
    header,
    headerTx,
    goBack,
    openAdd,
    openSort,
    openShare,
    openDelete,
    toggleSelectAll,
    openMoveToFolder,
    selectedCount,
    isSelecting,
    clearSelect,
    handleRestore,
  } = props
  // ----------------------- PARAMS ------------------------

  // ----------------------- COMPUTED ------------------------

  const isShowAddFunc = !isTrash

  // disable entering animation for first render
  const enabledEnteringAnimation = useSharedValue(false)

  // ----------------------- METHODS ------------------------

  // const handleRestore = async () => {
  //   const res = await restoreCiphers(selectedItems)
  //   if (res.kind === "ok") {
  //     setIsSelecting(false)
  //     setSelectedItems([])
  //   }
  // }

  // ----------------------- ANIMATIONS ------------------------
  const FadeInUp = () => {
    "worklet"
    return {
      initialValues: {
        opacity: enabledEnteringAnimation.value ? 0 : 1,
        transform: [{ translateY: enabledEnteringAnimation.value ? -30 : 0 }],
      },
      animations: {
        opacity: withTiming(1, { duration: 300 }),
        transform: [{ translateY: withTiming(0, { duration: 300 }) }],
      },
    }
  }

  // ----------------------- RENDER ------------------------

  return (
    <View style={styles.headerContainer}>
      {!isSelecting && (
        <Animated.View entering={FadeInUp} exiting={FadeOutUp} style={styles.container}>
          <View style={styles.rowContainer}>
            <Icon icon={"arrow-left"} onPress={goBack} style={styles.mr8} />
            <Text preset="bold" size="xl" weight="semibold" text={header} tx={headerTx} />
          </View>
          <View style={styles.rowContainer}>
            <Icon
              icon="sliders-horizontal"
              onPress={openSort}
              containerStyle={styles.iconContainer}
            />
            {isShowAddFunc && (
              <Icon icon="plus" onPress={openAdd} containerStyle={styles.iconContainer} />
            )}
          </View>
        </Animated.View>
      )}
      {isSelecting && (
        <Animated.View
          entering={FadeInDown.withCallback((finished) => {
            enabledEnteringAnimation.value = finished
          })}
          exiting={FadeOutDown}
        >
          <CipherListSelectionHeader
            isTrash={isTrash}
            selectedCount={selectedCount}
            onClose={clearSelect}
            onShare={openShare}
            onSelectAll={toggleSelectAll}
            onMoveFolder={openMoveToFolder}
            onRestore={handleRestore}
            onDelete={openDelete}
          />
        </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerContainer: {
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  iconContainer: {
    padding: 8,
  },
  mr8: {
    marginRight: 8,
  },
  rowContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
})
