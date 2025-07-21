import { View, StyleSheet } from "react-native"
import { PressableIcon, Text } from "app/components/cores"
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
  isHideAddFunc?: boolean
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
    isHideAddFunc,
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

  // disable entering animation for first render
  const enabledEnteringAnimation = useSharedValue(false)

  // ----------------------- METHODS ------------------------

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
          <View style={styles.title}>
            <PressableIcon icon={"arrow-left"} onPress={goBack} style={styles.mr8} />
            <Text
              preset="bold"
              size="xl"
              weight="semiBold"
              numberOfLines={2}
              ellipsizeMode="tail"
              text={header}
              tx={headerTx}
            />
          </View>
          <View style={styles.rowContainer}>
            <PressableIcon
              icon="sliders-horizontal"
              onPress={openSort}
              containerStyle={styles.iconContainer}
            />
            {!isHideAddFunc && (
              <PressableIcon icon="plus" onPress={openAdd} containerStyle={styles.iconContainer} />
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
    justifyContent: "center",
    minHeight: 56,
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
  title: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 32,
  },
})
