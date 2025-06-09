import React, { useEffect, useState } from "react"
import { View, StyleSheet } from "react-native"
import { Icon, Logo } from "app/components/cores"
import { AppNotification } from "app/static/types"
import { useTheme } from "app/services/context"
import { useStores } from "app/models"
import { useToast } from "app/services/utils"
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated"
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

  const [notifications, setNotifications] = useState<AppNotification | null>(null)

  // ----------------------- COMPUTED ------------------------
  const unreadCount = notifications?.unread_count || 0
  const isFreeAccount = user.isFreePlan

  // ----------------------- METHODS ------------------------

  const fetchInAppNotification = async () => {
    const res = await user.fetchInAppNoti()
    if (res.kind === "ok") {
      setNotifications(res.data)
    } else {
      notifyApiError(res)
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
        <Animated.View entering={FadeInUp} exiting={FadeOutDown} style={styles.container}>
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
        <CipherListSelectionHeader
          isFreeAccount={isFreeAccount}
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
