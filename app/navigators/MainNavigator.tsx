/**
 * This is the navigator you will modify to display the logged-in screens of your app.
 * You can use RootNavigator to also display an auth flow or other user flows.
 *
 * You'll likely spend most of your time in this file.
 */
import React, { FC, useEffect, useRef, useState } from "react"
import { AppState } from "react-native"
import { createStackNavigator } from "@react-navigation/stack"
import { MainTabNavigator } from "./MainTabNavigator"
import { ToolsNavigator } from "./tools/ToolNavigator"
import UserInactivity from "react-native-user-inactivity"
import InAppReview from "react-native-in-app-review"
import { useStores } from "../models"
import { CF_ACCESS_CLIENT_ID, CF_ACCESS_CLIENT_SECRET, IS_IOS, WS_URL } from "../config/constants"
import { AppTimeoutType, SocketEvent, SocketEventType } from "app/static/types"

import {
  BiometricUnlockIntroScreen,
  PasswordEditScreen,
  PasswordInfoScreen,
  FolderSelectScreen,
  PasswordGeneratorScreen,
  DataBreachScannerScreen,
  NoteEditScreen,
  CardEditScreen,
  IdentityEditScreen,
  CardInfoScreen,
  IdentityInfoScreen,
  NoteInfoScreen,
  FolderCiphersScreen,
  DataBreachDetailScreen,
  DataBreachListScreen,
  QRScannerScreen,
  AuthenticatorEditScreen,
  CryptoWalletEditScreen,
  CryptoWalletInfoScreen,
  ShareMultipleScreen,
  FolderSharedUsersManagementScreen,
  InAppListNotificationScreen,
  EnterpriseInvitedScreen,
  NormalSharesScreen,
  QuickSharesScreen,
  Password2FASetupScreen,
  QuickSharesDetailScreen,
  PasswordHistoryScreen,
  AttachmentScreen,
  MarketingScreen,
  MenuStack,
} from "../screens"
import { useCipherData } from "app/services/hook"
import { Logger } from "app/utils/utils"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { observer } from "mobx-react-lite"
import { AuthRoute, RootStackScreenProps } from "./navigators.types"
import { useFocusEffect } from "@react-navigation/native"
import { AutoFillScreen } from "app/screens/autofill"
import { useToast } from "app/services/utils"

const Stack = createStackNavigator<AuthRoute>()

export const MainNavigator: FC<RootStackScreenProps<"mainStack">> = observer((props) => {
  const navigation = props.navigation
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
  const timeout = useRef(null)
  const activeHandling = useRef(false)
  const transitionEnd = useRef(false)
  const temporaryLock = useRef(false)

  const [batchDecryptionEnded, setBatchDecryptionEnded] = useState(false)
  const [socket, setSocket] = useState(null)

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
      if (bumpTimestamp <= cipherStore.lastSync) {
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
                  data.data.ids.map(async (id) => {
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
      timeout.current = setTimeout(async () => {
        if (!uiStore.isOffline && user.isLoggedInPw) {
          // Manually check for update
          await handleSync()
          setSocket(generateSocket())
        }
      }, 10000)
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
      toolStore.setLastHealthCheck(null)
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
      clearTimeout(timeout.current)
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
          name="marketing"
          component={MarketingScreen}
          options={{
            presentation: "transparentModal",
          }}
        />

        <Stack.Screen name="enterpriseInvited" component={EnterpriseInvitedScreen} />
        <Stack.Screen name="biometricUnlockIntro" component={BiometricUnlockIntroScreen} />

        <Stack.Screen name="mainTab" component={MainTabNavigator} />
        <Stack.Screen name="toolsStack" component={ToolsNavigator} />

        <Stack.Screen name="app_list_noti" component={InAppListNotificationScreen} />

        <Stack.Screen
          name="passwordGenerator"
          component={PasswordGeneratorScreen}
          initialParams={{ fromTools: false }}
          options={{
            gestureEnabled: false,
          }}
        />

        <Stack.Screen name="qrScanner" component={QRScannerScreen} />
        <Stack.Screen
          name="authenticator__edit"
          component={AuthenticatorEditScreen}
          initialParams={{ mode: "add" }}
        />

        <Stack.Screen name="dataBreachScanner" component={DataBreachScannerScreen} />
        <Stack.Screen name="dataBreachList" component={DataBreachListScreen} />
        <Stack.Screen name="dataBreachDetail" component={DataBreachDetailScreen} />

        <Stack.Screen
          name="normal_shares"
          component={NormalSharesScreen}
          initialParams={{ ciphers: [] }}
        />

        <Stack.Screen name="quick_shares" component={QuickSharesScreen} />
        <Stack.Screen name="quickShareItemsDetail" component={QuickSharesDetailScreen} />

        <Stack.Screen name="passwords__info" component={PasswordInfoScreen} />
        <Stack.Screen
          name="passwords__edit"
          component={PasswordEditScreen}
          initialParams={{ mode: "add" }}
        />
        <Stack.Screen name="passwords_2fa_setup" component={Password2FASetupScreen} />
        <Stack.Screen name="passwords_history" component={PasswordHistoryScreen} />

        <Stack.Screen name="notes__info" component={NoteInfoScreen} />
        <Stack.Screen
          name="notes__edit"
          component={NoteEditScreen}
          initialParams={{ mode: "add" }}
        />
        <Stack.Screen name="cards__info" component={CardInfoScreen} />
        <Stack.Screen
          name="cards__edit"
          component={CardEditScreen}
          initialParams={{ mode: "add" }}
        />
        <Stack.Screen name="identities__info" component={IdentityInfoScreen} />
        <Stack.Screen
          name="identities__edit"
          component={IdentityEditScreen}
          initialParams={{ mode: "add" }}
        />

        <Stack.Screen
          name="folders__select"
          component={FolderSelectScreen}
          initialParams={{ mode: "add" }}
        />
        <Stack.Screen name="folders__ciphers" component={FolderCiphersScreen} />
        <Stack.Screen name="shareFolder" component={FolderSharedUsersManagementScreen} />
        <Stack.Screen name="shareMultiple" component={ShareMultipleScreen} />
        <Stack.Screen name="cryptoWallets__info" component={CryptoWalletInfoScreen} />
        <Stack.Screen
          name="cryptoWallets__edit"
          component={CryptoWalletEditScreen}
          initialParams={{ mode: "add" }}
        />
        <Stack.Screen name="autofill" component={AutoFillScreen} />
        <Stack.Screen name="attachment" component={AttachmentScreen} />
        <Stack.Screen name="menuStack" component={MenuStack} />
      </Stack.Navigator>
    </UserInactivity>
  )
})
