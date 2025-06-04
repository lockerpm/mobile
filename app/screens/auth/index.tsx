import React, { FC, useEffect, useRef, useState } from "react"
import { AppState } from "react-native"
import { createStackNavigator } from "@react-navigation/stack"
import UserInactivity from "react-native-user-inactivity"
import InAppReview from "react-native-in-app-review"
import { CF_ACCESS_CLIENT_ID, CF_ACCESS_CLIENT_SECRET, IS_IOS, WS_URL } from "app/config/constants"
import { AppTimeoutType, LockType, SocketEvent, SocketEventType } from "app/static/types"
import { useCipherData } from "app/services/hook"
import { Logger } from "app/utils/utils"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { observer } from "mobx-react-lite"
import { useFocusEffect } from "@react-navigation/native"
import { useToast } from "app/services/utils"
import { AuthRoute, RootStackScreenProps } from "app/navigators"
import { useStores } from "app/models"
import {
  AutoFillAndroidScreen,
  BrowseStack,
  HomeStack,
  MarketingScreen,
  MenuStack,
  QRScannerScreen,
  TabNavigator,
  ToolStack,
} from "./screens"

const Stack = createStackNavigator<AuthRoute>()

export const AuthStack: FC<RootStackScreenProps<"authStack">> = observer(({ navigation }) => {
  const { notifyTx } = useToast()
  const {
    getCipherById,
    syncAutofillData,
    syncSingleCipher,
    syncSingleFolder,
    syncOfflineData,
    startSyncProcess,
    syncQuickShares,
  } = useCipherData()
  const { uiStore, user, cipherStore, toolStore } = useStores()

  // ------------------ PARAMS --------------------

  const prevAppState = useRef("")
  const appIsActive = useRef(true)
  const timeout = useRef<NodeJS.Timeout[]>([])
  const activeHandling = useRef(false)
  const transitionEnd = useRef(false)
  const temporaryLock = useRef(false)

  const [batchDecryptionEnded, setBatchDecryptionEnded] = useState(false)
  const [socket, setSocket] = useState<WebSocket | null>(null)

  // ------------------ METHODS --------------------

  // Sync
  const handleSync = async () => {
    user.loadTeams()
    user.loadPlan()

    // Sync offline data
    await syncOfflineData()

    // Check if sync is needed
    const lastUpdateRes = await cipherStore.getLastUpdate()
    let bumpTimestamp = 0
    if (lastUpdateRes.kind === "unauthorized") {
      return
    }
    if (lastUpdateRes.kind === "ok") {
      bumpTimestamp =
        (lastUpdateRes.data.revision_date - new Date().getTimezoneOffset() * 60) * 1000
      if (bumpTimestamp <= (cipherStore.lastSync ?? 0)) {
        return
      }
    }

    // Send request
    const syncRes = await startSyncProcess(bumpTimestamp)
    if (!syncRes || syncRes.kind !== "ok") {
      notifyTx("error", "error.sync_failed")
      return
    }

    // Load data
    if (cipherStore.selectedCipher) {
      const updatedCipher = await getCipherById(cipherStore.selectedCipher.id)
      cipherStore.setSelectedCipher(updatedCipher)
    }
  }

  // Check invitation
  const handleUserDataSync = () => {
    Promise.all([
      user.getInvitations(),
      cipherStore.loadSharingInvitations(),
      cipherStore.loadMyShares(),
    ])
  }

  // request in app review
  const requestInAppReview = () => {
    if (!InAppReview.isAvailable()) return

    if (uiStore.isShowedAppReview) return

    const currentTime = new Date().getTime()

    // set InAppreview UI display after ~ 6 days  of using this app
    if (uiStore.inAppReviewShowDate) {
      if (uiStore.inAppReviewShowDate < currentTime)
        // trigger UI InAppreview
        InAppReview.RequestInAppReview()
          .then((hasFlowFinishedSuccessfully) => {
            if (hasFlowFinishedSuccessfully) {
              // display ui only 1 time
              uiStore.setIsShowedAppReview(true)
            }
          })
          .catch((error) => {
            Logger.error(error)
          })
    } else {
      uiStore.setInAppReviewShowDate(currentTime + 6e8)
    }
  }

  // On app return from background -> lock? + sync autofill data + check push noti navigation
  const _handleAppStateChange = async (nextAppState: string) => {
    if (prevAppState.current === nextAppState) {
      return
    }
    prevAppState.current = nextAppState

    Logger.debug(nextAppState)

    // Ohter state (background/inactive)
    if (nextAppState !== "active") {
      appIsActive.current = false
      activeHandling.current = false
      return
    }

    if (!activeHandling.current) {
      activeHandling.current = true
      // Sync autofill data on iOS
      if (IS_IOS && !appIsActive.current) {
        syncAutofillData()
      }

      // Active
      if (!appIsActive.current) {
        appIsActive.current = true

        //  Check lock screen
        if (user.appTimeout === AppTimeoutType.SCREEN_OFF && !temporaryLock.current) {
          temporaryLock.current = true
          navigation.push("lock", {
            temporaryLock: true,
            type: LockType.Individual,
          })
          activeHandling.current = false
          return
        }
      }
      activeHandling.current = false
    }
  }

  // App inactive trigger
  const handleInactive = async (isActive: boolean) => {
    if (!isActive && user.appTimeout > 0 && !temporaryLock.current) {
      navigation.push("lock", {
        temporaryLock: true,
        type: LockType.Individual,
      })
    }
  }

  // Web socket
  const generateSocket = () => {
    // Note: using undocumented param (https://stackoverflow.com/questions/37246446/sending-cookies-with-react-native-websockets)
    // @ts-ignore
    const ws = new WebSocket(`${WS_URL}?token=${user.apiToken}`, [], {
      headers: {
        "CF-Access-Client-Id": CF_ACCESS_CLIENT_ID,
        "CF-Access-Client-Secret": CF_ACCESS_CLIENT_SECRET,
      },
    })
    ws.onopen = () => {
      Logger.debug("SOCKET OPEN")
    }

    ws.onmessage = async (e) => {
      const data = JSON.parse(e.data)
      Logger.debug("WEBSOCKET EVENT: " + data.event)

      switch (data.event) {
        // SYNC
        case SocketEvent.SYNC:
          switch (data.type) {
            case SocketEventType.CIPHER_UPDATE: {
              if (data.data.ids) {
                Promise.all(
                  data.data.ids.map(async (id: string) => {
                    syncSingleCipher(id)
                  }),
                )
              } else {
                const cipherId = data.data.id
                syncSingleCipher(cipherId)
              }
              break
            }
            case SocketEventType.FOLDER_UPDATE: {
              const folderId = data.data.id
              syncSingleFolder(folderId)
              break
            }
            default:
              handleSync()
          }
          break

        // MEMBERS
        case SocketEvent.MEMBERS:
          handleUserDataSync()
          break
        case SocketEvent.QUICK_SHARE:
          syncQuickShares()
          break
        default:
          break
      }
    }

    ws.onerror = (e) => {
      Logger.debug(`SOCKET ERROR: ${JSON.stringify(e)}`)
    }

    ws.onclose = (e) => {
      Logger.debug(`SOCKET CLOSE: ${JSON.stringify(e)}`)
      // Auto reconnect
      const id = setTimeout(async () => {
        if (!uiStore.isOffline && user.isLoggedInPw) {
          // Manually check for update
          await handleSync()
          setSocket(generateSocket())
        }
      }, 10000)
      timeout.current.push(id)
    }

    return ws
  }

  // ------------------ EFFECT --------------------
  // Web socket connection
  useEffect(() => {
    if (!uiStore.isOffline && !socket && user.isLoggedInPw) {
      setSocket(generateSocket())
    }
    return () => {
      if (uiStore.isOffline || !user.isLoggedInPw) {
        socket && socket.close()
        setSocket(null)
      }
    }
  }, [!!socket, uiStore.isOffline, user.isLoggedInPw])

  // Check network to sync
  useEffect(() => {
    if (batchDecryptionEnded) {
      if (!uiStore.isOffline && user.isLoggedInPw) {
        handleSync()
      }
    }
  }, [uiStore.isOffline, user.isLoggedInPw, batchDecryptionEnded])

  useFocusEffect(
    React.useCallback(() => {
      temporaryLock.current = false
    }, []),
  )

  // Outdated data warning
  useEffect(() => {
    const subscription = AppState.addEventListener("change", _handleAppStateChange)

    const listenerPWUpdate = EventBus.createListener(AppEventType.PASSWORD_UPDATE, () => {
      toolStore.setLastHealthCheck(0)
    })
    const listenerBatchDecrypt = EventBus.createListener(AppEventType.NEW_BATCH_DECRYPTED, () => {
      cipherStore.setLastCacheUpdate()
    })
    const listenerAll = EventBus.createListener(AppEventType.DECRYPT_ALL_STATUS, (status) => {
      switch (status) {
        case "started":
          cipherStore.setIsBatchDecrypting(true)
          break
        case "ended":
          cipherStore.setIsBatchDecrypting(false)
          syncAutofillData()
          setBatchDecryptionEnded(true)
          break
      }
    })
    const unsubscribeNavigationEnd = navigation.addListener("transitionEnd", () => {
      if (!transitionEnd.current) {
        transitionEnd.current = true
        requestInAppReview()
        handleUserDataSync()
      }
    })

    return () => {
      subscription.remove()
      EventBus.removeListener(listenerBatchDecrypt)
      EventBus.removeListener(listenerAll)
      EventBus.removeListener(listenerPWUpdate)
      unsubscribeNavigationEnd()
      timeout.current.forEach(clearTimeout)
      timeout.current = []
    }
  }, [])

  // ------------------ RENDER --------------------

  return (
    <UserInactivity
      timeForInactivity={user.appTimeout && user.appTimeout > 0 ? user.appTimeout : 1000}
      onAction={handleInactive}
    >
      <Stack.Navigator
        initialRouteName="mainTab"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="marketingModal"
          component={MarketingScreen}
          options={{
            presentation: "transparentModal",
          }}
        />

        <Stack.Screen
          name="qrScannerModal"
          component={QRScannerScreen}
          options={{
            presentation: "transparentModal",
          }}
        />
        <Stack.Screen name="mainTab" component={TabNavigator} />
        <Stack.Screen name="homeStack" component={HomeStack} />
        <Stack.Screen name="toolsStack" component={ToolStack} />
        <Stack.Screen name="menuStack" component={MenuStack} />
        <Stack.Screen name="browseStack" component={BrowseStack} />
        <Stack.Screen name="autofillAndroid" component={AutoFillAndroidScreen} />
      </Stack.Navigator>
    </UserInactivity>
  )
})
