import { FC, useCallback, useEffect, useRef, useState } from "react"
import { AppState } from "react-native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import UserInactivity from "react-native-user-inactivity"

import { AppTimeoutType, LockType, SocketEvent, SocketEventType } from "app/static/types"
import { useCipherData } from "app/services/hook"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { observer } from "mobx-react-lite"
import { useFocusEffect } from "@react-navigation/native"
import { useToast } from "app/services/utils"
import { AuthRoute, AppScreenProps, modalScreenOptions } from "app/navigators"
import { useStores } from "app/models"
import {
  AddCipherModalScreen,
  BrowseStack,
  AndroidAutofillStack,
  CipherActionsModalScreen,
  HomeStack,
  MarketingScreen,
  MenuStack,
  QRScannerScreen,
  TabNavigator,
  ToolStack,
} from "./screens"
import { Logger } from "@/utils/logger"
import Config from "@/config"
import { useInAppReview } from "./useInAppReview"
import { isAndroidAutofillService } from "@/utils/autofillHelper"

const Stack = createNativeStackNavigator<AuthRoute>()

export const AuthStack: FC<AppScreenProps<"authStack">> = observer(({ navigation }) => {
  const { notifyTx } = useToast()
  const {
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
  const handleSync = useCallback(async () => {
    if (!isAndroidAutofillService) {
      user.loadTeams()
      user.loadPlan()

      // Sync offline data
      await syncOfflineData()
    }

    // Check if sync is needed
    const lastUpdateRes = await cipherStore.getLastUpdate()
    let bumpTimestamp = 0
    if (lastUpdateRes.kind === "unauthorized") {
      return
    }
    if (lastUpdateRes.kind === "ok") {
      bumpTimestamp = lastUpdateRes.data.revision_date * 1000

      console.log("BUMP TIMESTAMP: ", bumpTimestamp, cipherStore.lastSync)
      if (bumpTimestamp <= (cipherStore.lastSync ?? 0)) {
        return
      }
    }
    // Send request
    const syncRes = await startSyncProcess(bumpTimestamp)
    if (!syncRes || syncRes.kind !== "ok") {
      notifyTx("error", "error:sync_failed")
      return
    }
  }, [cipherStore, notifyTx, startSyncProcess, syncOfflineData, user])

  // Check invitation
  const handleUserDataSync = useCallback(() => {
    if (!isAndroidAutofillService) {
      Promise.all([
        user.getInvitations(),
        cipherStore.loadSharingInvitations(),
        cipherStore.loadMyShares(),
      ])
    }
  }, [cipherStore, user, isAndroidAutofillService])

  // On app return from background -> lock? + sync autofill data + check push noti navigation
  const _handleAppStateChange = useCallback(
    async (nextAppState: string) => {
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
        if (!appIsActive.current) {
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
    },
    [navigation, syncAutofillData, user.appTimeout]
  )

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
  const generateSocket = useCallback(() => {
    // Note: using undocumented param (https://stackoverflow.com/questions/37246446/sending-cookies-with-react-native-websockets)
    // @ts-ignore
    const ws = new WebSocket(`${Config.WS_URL}?token=${user.apiToken}`, [], {
      headers: {
        "CF-Access-Client-Id": Config.CF_ACCESS_CLIENT_ID,
        "CF-Access-Client-Secret": Config.CF_ACCESS_CLIENT_SECRET,
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
                  })
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
  }, [
    handleSync,
    handleUserDataSync,
    syncQuickShares,
    syncSingleCipher,
    syncSingleFolder,
    uiStore.isOffline,
    user.apiToken,
    user.isLoggedInPw,
  ])

  // ------------------ EFFECT --------------------

  useInAppReview()

  useEffect(() => {
    if (!uiStore.isOffline && !socket && user.isLoggedInPw && !isAndroidAutofillService) {
      setSocket(generateSocket())
    }
    return () => {
      if (uiStore.isOffline || !user.isLoggedInPw || !isAndroidAutofillService) {
        if (socket && socket.readyState === WebSocket.OPEN) {
          Logger.debug("CLOSE SOCKET")
          socket.close()
          setSocket(null)
          // Close socket
        }
      }
    }
  }, [isAndroidAutofillService, socket, uiStore.isOffline, user.isLoggedInPw])

  // Check network to sync
  useEffect(() => {
    if (batchDecryptionEnded) {
      if (!uiStore.isOffline && user.isLoggedInPw) {
        handleSync()
      }
    }
  }, [uiStore.isOffline, user.isLoggedInPw, batchDecryptionEnded, handleSync])

  useFocusEffect(() => {
    temporaryLock.current = false
  })

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
  }, [
    _handleAppStateChange,
    cipherStore,
    handleUserDataSync,
    navigation,
    syncAutofillData,
    toolStore,
  ])

  // ------------------ RENDER --------------------

  return (
    <UserInactivity
      timeForInactivity={user.appTimeout && user.appTimeout > 0 ? user.appTimeout : 1000}
      onAction={handleInactive}
    >
      <Stack.Navigator
        initialRouteName={isAndroidAutofillService ? "androidAutofillStack" : "mainTab"}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="androidAutofillStack" component={AndroidAutofillStack} />
        <Stack.Screen name="browseStack" component={BrowseStack} />

        {/** Main stack modal */}

        <Stack.Group screenOptions={modalScreenOptions}>
          <Stack.Screen name="cipherActionsModal" component={CipherActionsModalScreen} />
          <Stack.Screen name="addCipherModal" component={AddCipherModalScreen} />
          <Stack.Screen name="marketingModal" component={MarketingScreen} />
          <Stack.Screen name="qrScannerModal" component={QRScannerScreen} />
        </Stack.Group>
        <Stack.Screen name="mainTab" component={TabNavigator} />
        <Stack.Screen name="homeStack" component={HomeStack} />
        <Stack.Screen name="toolsStack" component={ToolStack} />
        <Stack.Screen name="menuStack" component={MenuStack} />
      </Stack.Navigator>
    </UserInactivity>
  )
})
