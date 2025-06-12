import React, { useEffect, useState } from "react"
import { View, StyleSheet } from "react-native"
import { Icon, Logo } from "app/components/cores"
import { AppNotification } from "app/static/types"
import { useTheme } from "app/services/context"
import { useStores } from "app/models"
import { useToast } from "app/services/utils"
import Animated, {
  FadeInDown,
  FadeOutDown,
  FadeOutUp,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { CipherListSelectionHeader } from "app/components/newCiphers"

interface Props {
  openSort: () => void
  openAdd: () => void
  openAppNoti: (notifications: AppNotification) => void
  openMoveToFolder: () => void
  openShare: () => void
  openDelete: () => void
  toggleSelectAll: () => void

  isSelecting: boolean
  setIsSelecting: (val: boolean) => void
  selectedItems: string[]
  setSelectedItems: (val: any) => void
}

export const HomeHeader = (props: Props) => {
  const {
    openAdd,
    openSort,
    openAppNoti,
    openShare,
    openDelete,
    toggleSelectAll,
    openMoveToFolder,
    isSelecting,
    setIsSelecting,
    selectedItems,
    setSelectedItems,
  } = props
  const { colors, isDark } = useTheme()
  const { notifyApiError } = useToast()
  const { user } = useStores()

  // ----------------------- PARAMS ------------------------
  // disable entering animation for first render
  const enabledEnteringAnimation = useSharedValue(false)

  const [notifications, setNotifications] = useState<AppNotification | null>(null)

  // ----------------------- COMPUTED ------------------------
  const unreadCount = notifications?.unread_count || 0

  // ----------------------- METHODS ------------------------

  const fetchInAppNotification = async () => {
    const res = await user.fetchInAppNoti()
    if (res.kind === "ok") {
      setNotifications(res.data)
    } else {
      notifyApiError(res)
    }
  }

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

  // ----------------------- EFFECT ------------------------
  useEffect(() => {
    fetchInAppNotification()
  }, [])

  // ----------------------- RENDER ------------------------

  return (
    <View style={styles.headerContainer}>
      {!isSelecting && (
        <Animated.View entering={FadeInUp} exiting={FadeOutUp} style={styles.container}>
          <Logo preset={isDark ? "horizontal-light" : "horizontal-dark"} style={styles.logo} />
          <View style={styles.rowContainer}>
            {!!notifications && (
              <View>
                {unreadCount > 0 && (
                  <View
                    style={[
                      styles.noti,
                      {
                        backgroundColor: colors.error,
                      },
                    ]}
                  />
                )}
                <Icon
                  icon="bell"
                  onPress={() => openAppNoti(notifications)}
                  containerStyle={styles.iconContainer}
                />
              </View>
            )}

            <Icon
              icon="sliders-horizontal"
              onPress={openSort}
              containerStyle={styles.iconContainer}
            />
            <Icon icon="plus" onPress={openAdd} containerStyle={styles.iconContainer} />
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
            selectedCipherIds={selectedItems}
            onClose={() => {
              setIsSelecting(false)
              setSelectedItems([])
            }}
            onShare={openShare}
            onSelectAll={toggleSelectAll}
            onMoveFolder={openMoveToFolder}
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
  logo: {
    height: 35,
    width: 115,
  },
  noti: {
    borderRadius: 3,
    height: 6,
    position: "absolute",
    right: 10,
    top: 10,
    width: 6,
  },
  rowContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
})
