import React, { useEffect, useState, useRef } from "react"
import { AppState } from "react-native"
import { createStackNavigator } from "@react-navigation/stack"
import { useNavigation } from "@react-navigation/native"
import { MainTabNavigator } from "./MainTabNavigator"
import { ToolsNavigator } from "./tools/ToolNavigator"
import UserInactivity from "react-native-user-inactivity"
import InAppReview from "react-native-in-app-review"
import { useStores } from "../models"
import { IS_IOS, WS_URL } from "../config/constants"
import { AppTimeoutType, SocketEvent, SocketEventType, TimeoutActionType } from "app/static/types"

import {
  StartScreen,
  BiometricUnlockIntroScreen,
  PasswordEditScreen,
  PasswordInfoScreen,
  FolderSelectScreen,
  PasswordGeneratorScreen,
  DataBreachScannerScreen,
  NoteEditScreen,
  CardEditScreen,
  IdentityEditScreen,
  SettingsScreen,
  ChangeMasterPasswordScreen,
  HelpScreen,
  CardInfoScreen,
  IdentityInfoScreen,
  NoteInfoScreen,
  FolderCiphersScreen,
  DataBreachDetailScreen,
  DataBreachListScreen,
  ImportScreen,
  ExportScreen,
  QRScannerScreen,
  AuthenticatorEditScreen,
  CryptoWalletEditScreen,
  CryptoWalletInfoScreen,
  AutoFillScreen,
  NotificationSettingsScreen,
  ShareMultipleScreen,
  DataOutdatedScreen,
  FolderSharedUsersManagementScreen,
  PushEmailSettingsScreen,
  PushNotificationSettingsScreen,
  InAppListNotificationScreen,
  EmergencyAccessScreen,
  YourTrustedContactScreen,
  ContactsTrustedYouScreen,
  ViewEAScreen,
  TakeoverEAScreen,
  // @ts-ignore
  AutofillServiceScreen,
  EnterpriseInvitedScreen,
  NormalSharesScreen,
  QuickSharesScreen,
  Password2FASetupScreen,
  QuickSharesDetailScreen,
} from "../screens"
import { useAuthentication, useCipherData, useHelper } from "app/services/hook"
import { Logger } from "app/utils/utils"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { observer } from "mobx-react-lite"
import { PrimaryParamList } from "./navigators.types"

const Stack = createStackNavigator<PrimaryParamList>()

export const MainNavigator = observer(() => {
  const navigation = useNavigation() as any
  const { notify, parsePushNotiData } = useHelper()
  const { lock, logout } = useAuthentication()
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
  const { translate } = useHelper()

  // ------------------ PARAMS --------------------

  let appIsActive = true // Cache this to compare to old state
  let timeout = null
  const [batchDecryptionEnded, setBatchDecryptionEnded] = useState(false)
  const [socket, setSocket] = useState(null)

  // ------------------ METHODS --------------------

  // Sync
  const handleSync = async () => {
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
      notify("error", translate("error.sync_failed"))
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
    user.getInvitations()
    cipherStore.loadSharingInvitations()
    cipherStore.loadMyShares()
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

  const activeHandling = useRef(false)

  // On app return from background -> lock? + sync autofill data + check push noti navigation
  const _handleAppStateChange = async (nextAppState: string) => {
    // if (prevAppState.current === nextAppState) {
    //   return
    // }
    // prevAppState.current = nextAppState

    Logger.debug(nextAppState)

    // Ohter state (background/inactive)
    if (nextAppState !== "active") {
      appIsActive = false
      activeHandling.current = false
      return
    }

    if (!activeHandling.current) {
      activeHandling.current = true
      // Sync autofill data on iOS
      if (IS_IOS && !appIsActive) {
        syncAutofillData()
      }

      // Active
      if (!appIsActive) {
        appIsActive = true

        //  Check lock screen
        if (user.appTimeout === AppTimeoutType.SCREEN_OFF) {
          // Dont lock if user just return from overlay task

          // Check user settings to lock
          if (user.appTimeoutAction === TimeoutActionType.LOGOUT) {
            await logout()
            navigation.navigate("login")
          } else {
            await lock()
            navigation.navigate("lock")
          }

          activeHandling.current = false
          return
        }

        // Check push noti data
        const navigationRequest = await parsePushNotiData()
        if (navigationRequest.path) {
          // handle navigate browse
          navigationRequest.tempParams &&
            navigation.navigate(navigationRequest.path, navigationRequest.tempParams)
          navigation.navigate(navigationRequest.path, navigationRequest.params)
        }
      }
      activeHandling.current = false
    }
  }

  // App inactive trigger
  const handleInactive = async (isActive: boolean) => {
    if (!isActive && user.appTimeout && user.appTimeout > 0) {
      if (user.appTimeoutAction === TimeoutActionType.LOGOUT) {
        await logout()
        navigation.navigate("login")
      } else {
        await lock()
        navigation.navigate("lock")
      }
    }
  }
  // Web socket
  const generateSocket = () => {
    // Note: using undocumented param (https://stackoverflow.com/questions/37246446/sending-cookies-with-react-native-websockets)
    const ws = new WebSocket(`${WS_URL}?token=${user.apiToken}`, [])
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
      timeout = setTimeout(async () => {
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

  // check app revire
  useEffect(() => {
    requestInAppReview()
  }, [])

  // Check device screen on/off
  useEffect(() => {
    const subscription = AppState.addEventListener("change", _handleAppStateChange)

    return () => {
      subscription.remove()
      clearTimeout(timeout)
    }
  }, [timeout])

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
        handleUserDataSync()
      }
    }
  }, [uiStore.isOffline, user.isLoggedInPw, batchDecryptionEnded])

  // Recalculate password health on password update
  useEffect(() => {
    const listener = EventBus.createListener(AppEventType.PASSWORD_UPDATE, () => {
      toolStore.setLastHealthCheck(null)
    })
    return () => {
      EventBus.removeListener(listener)
    }
  }, [])

  // Outdated data warning
  useEffect(() => {
    const listener = EventBus.createListener(AppEventType.TEMP_ID_DECTECTED, () => {
      navigation.navigate("dataOutdated")
    })
    return () => {
      EventBus.removeListener(listener)
    }
  }, [])

  // New batch decrypted
  useEffect(() => {
    const listener = EventBus.createListener(AppEventType.NEW_BATCH_DECRYPTED, () => {
      cipherStore.setLastCacheUpdate()
    })
    return () => {
      EventBus.removeListener(listener)
    }
  }, [])

  // Batch decrypte
  useEffect(() => {
    const listener = EventBus.createListener(AppEventType.DECRYPT_ALL_STATUS, (status) => {
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
    return () => {
      EventBus.removeListener(listener)
    }
  }, [])

  // ------------------ RENDER --------------------

  return (
    <UserInactivity
      timeForInactivity={user.appTimeout && user.appTimeout > 0 ? user.appTimeout : 1000}
      onAction={handleInactive}
    >
      <Stack.Navigator
        initialRouteName="start"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="start" component={StartScreen} />

        <Stack.Screen name="enterpriseInvited" component={EnterpriseInvitedScreen} />
        <Stack.Screen name="biometricUnlockIntro" component={BiometricUnlockIntroScreen} />

        <Stack.Screen name="dataOutdated" component={DataOutdatedScreen} />

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
        <Stack.Screen name="settings" component={SettingsScreen} />
        <Stack.Screen name="changeMasterPassword" component={ChangeMasterPasswordScreen} />
        <Stack.Screen name="help" component={HelpScreen} />
        <Stack.Screen name="autofillService" component={AutofillServiceScreen} />
        <Stack.Screen name="import" component={ImportScreen} />
        <Stack.Screen name="export" component={ExportScreen} />
        <Stack.Screen name="notificationSettings" component={NotificationSettingsScreen} />
        <Stack.Screen name="emailNotiSettings" component={PushEmailSettingsScreen} />
        <Stack.Screen name="deviceNotiSettings" component={PushNotificationSettingsScreen} />

        <Stack.Screen name="autofill" component={AutoFillScreen} initialParams={{ mode: "all" }} />

        <Stack.Screen name="emergencyAccess" component={EmergencyAccessScreen} />
        <Stack.Screen name="yourTrustedContact" component={YourTrustedContactScreen} />
        <Stack.Screen name="contactsTrustedYou" component={ContactsTrustedYouScreen} />
        <Stack.Screen name="viewEA" component={ViewEAScreen} />
        <Stack.Screen name="takeoverEA" component={TakeoverEAScreen} />
      </Stack.Navigator>
    </UserInactivity>
  )
})
