/**
 * This is the navigator you will modify to display the logged-in screens of your app.
 * You can use RootNavigator to also display an auth flow or other user flows.
 *
 * You'll likely spend most of your time in this file.
 */
import React, { useEffect, useState } from "react"
import { AppState } from "react-native"
import { createStackNavigator } from "@react-navigation/stack"
import { MainTabNavigator } from "./main-tab-navigator"
import { 
  SwitchDeviceScreen, StartScreen, BiometricUnlockIntroScreen, PasswordEditScreen, 
  PasswordInfoScreen , FolderSelectScreen, PasswordGeneratorScreen,
  DataBreachScannerScreen, NoteEditScreen, CardEditScreen, IdentityEditScreen,
  CountrySelectorScreen, SettingsScreen, ChangeMasterPasswordScreen, HelpScreen,
  CardInfoScreen, IdentityInfoScreen, NoteInfoScreen, FolderCiphersScreen, DataBreachDetailScreen,
  DataBreachListScreen, ImportScreen, ExportScreen, QRScannerScreen, AuthenticatorEditScreen,
  CryptoAccountEditScreen, CryptoAccountInfoScreen, CryptoWalletEditScreen, CryptoWalletInfoScreen,
  GoogleAuthenticatorImportScreen, AutoFillScreen, NotificationSettingsScreen, ShareMultipleScreen, 
  PaymentScreen, ManagePlanScreen, InviteMemberScreen, DataOutdatedScreen
} from "../screens"
// @ts-ignore
import { AutofillServiceScreen } from "../screens"
import UserInactivity from "react-native-user-inactivity"
import { useMixins } from "../services/mixins"
import { useNavigation } from "@react-navigation/native"
import { AppTimeoutType, TimeoutActionType, useStores } from "../models"
import { observer } from "mobx-react-lite"
import { useCipherAuthenticationMixins } from "../services/mixins/cipher/authentication"
import { useCipherDataMixins } from "../services/mixins/cipher/data"
import { IS_IOS, WS_URL } from "../config/constants"
import { Logger } from "../utils/logger"
import { SocketEvent, SocketEventType } from "../config/types"
import { HealthNavigator } from "./tools/health-navigator"
import { AppEventType, EventBus } from "../utils/event-bus"

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 */
export type PrimaryParamList = {
  // Nested
  mainTab: undefined
  healthStack: undefined

  // Errors
  dataOutdated: undefined

  // Others
  start: undefined
  switchDevice: undefined
  biometricUnlockIntro: undefined
  passwordGenerator: {
    fromTools?: boolean
  }
  authenticator__edit: {
    mode: 'add' | 'edit'
  }
  qrScanner: undefined
  googleAuthenticatorImport: undefined
  dataBreachScanner: undefined
  dataBreachList: undefined
  dataBreachDetail: undefined
  countrySelector: undefined
  passwords__info: undefined
  passwords__edit: {
    mode: 'add' | 'edit' | 'clone'
    initialUrl?: string
  }
  notes__info: undefined
  notes__edit: {
    mode: 'add' | 'edit' | 'clone'
  }
  cards__info: undefined
  cards__edit: {
    mode: 'add' | 'edit' | 'clone'
  }
  identities__info: undefined
  identities__edit: {
    mode: 'add' | 'edit' | 'clone'
  }
  folders__select: {
    mode: 'add' | 'move',
    initialId?: string,
    cipherIds?: string[]
  }
  folders__ciphers: {
    folderId?: string | null
    collectionId?: string | null
    organizationId?: string | null
  }
  manage_plan: undefined
  payment: {
    benefitTab?: 0 | 1 | 2 | 3,
    family?: boolean
  }
  invite_member: undefined
  settings: undefined
  changeMasterPassword: undefined
  help: undefined
  autofillService: undefined
  import: undefined
  export: undefined
  autofill: undefined
  notificationSettings: undefined
  shareMultiple: undefined
  cryptoAccounts__info: undefined
  cryptoAccounts__edit: {
    mode: 'add' | 'edit' | 'clone'
  }
  cryptoWallets__info: undefined
  cryptoWallets__edit: {
    mode: 'add' | 'edit' | 'clone'
  }
}

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createStackNavigator<PrimaryParamList>()

export const MainNavigator = observer(() => {
  const navigation = useNavigation()
  const { notify, translate, parsePushNotiData } = useMixins()
  const { lock, logout } = useCipherAuthenticationMixins()
  const { 
    getCipherById, syncAutofillData, syncSingleCipher, syncSingleFolder, syncOfflineData, startSyncProcess
  } = useCipherDataMixins()
  const { uiStore, user, cipherStore, toolStore } = useStores()

  // ------------------ PARAMS --------------------

  let appIsActive = true      // Cache this to compare to old state
  let timeout = null
  const [socket, setSocket] = useState(null)

  // ------------------ METHODS --------------------

  // Sync
  const handleSync = async () => {
    // Sync offline data
    await syncOfflineData()
    
    // Check if sync is needed
    const lastUpdateRes = await cipherStore.getLastUpdate()
    if (
      lastUpdateRes.kind === 'unauthorized' ||
      (lastUpdateRes.kind === 'ok' && lastUpdateRes.data.revision_date * 1000 <= cipherStore.lastSync)
    ) {
      return
    }

    // Send request
    const syncRes = await startSyncProcess()
    if (syncRes.kind !== 'ok') {
      if (syncRes.kind === 'error') {
        notify('error', translate('error.sync_failed'))
      }
      return
    }

    // Load data
    if (cipherStore.selectedCipher) {
      const updatedCipher = await getCipherById(cipherStore.selectedCipher.id)
      cipherStore.setSelectedCipher(updatedCipher)
    }
    user.loadTeams()
    user.loadPlan()
  }

  // Check invitation
  const handleUserDataSync = () => {
    user.getInvitations()
    cipherStore.loadSharingInvitations()    
    cipherStore.loadMyShares()
  }

  // On app return from background -> lock? + sync autofill data + check push noti navigation
  const _handleAppStateChange = async (nextAppState: string) => {
    Logger.debug(nextAppState)

    // Ohter state (background/inactive)
    if (nextAppState !== 'active') {
      appIsActive = false
      return
    }

    // Sync autofill data
    if (IS_IOS && !appIsActive) {
      syncAutofillData()
    }

    // Active
    if (!appIsActive) {
      appIsActive = true

      // Check lock screen
      if (user.appTimeout === AppTimeoutType.SCREEN_OFF) {
        // Dont lock if user just return from overlay task
        if (uiStore.isPerformOverlayTask) {
          uiStore.setIsPerformOverlayTask(false)
          return
        }

        // Check user settings to lock
        if (user.appTimeoutAction === TimeoutActionType.LOGOUT) {
          await logout()
          navigation.navigate('login')
        } else {
          await lock()
          navigation.navigate('lock')
        }
        return
      }

      // Check push noti data
      const navigationRequest = await parsePushNotiData()
      if (navigationRequest.path) {
        navigation.navigate(navigationRequest.path, navigationRequest.params)
        return
      }
    }
  }

  // App inactive trigger
  const handleInactive = async (isActive : boolean) => {
    if (!isActive && user.appTimeout && user.appTimeout > 0) {
      if (user.appTimeoutAction === TimeoutActionType.LOGOUT) {
        await logout()
        navigation.navigate('login')
      } else {
        await lock()
        navigation.navigate('lock')
      }
    }
  }

  // Web socket
  const generateSocket = () => {
    const ws = new WebSocket(`${WS_URL}?token=${user.apiToken}`)
    ws.onopen = () => {
      Logger.debug('SOCKET OPEN')
    }

    ws.onmessage = async (e) => {
      const data = JSON.parse(e.data)
      Logger.debug('WEBSOCKET EVENT: ' + data.event)
      switch (data.event) {
        // SYNC
        case SocketEvent.SYNC:
          switch (data.type) {
            case SocketEventType.CIPHER_UPDATE: {
              const cipherId = data.data.id
              syncSingleCipher(cipherId)
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
        default:
          break
      }
    }

    ws.onerror = (e) => {
      Logger.debug(`SOCKET ERROR: ${JSON.stringify(e)}`)
      timeout = setTimeout(async () => {
        if (ws.readyState === WebSocket.CLOSED && !uiStore.isOffline) {
          // WebSocket.CLOSED     = 3
          // WebSocket.CLOSING    = 2
          // WebSocket.CONNECTING = 0
          // WebSocket.OPEN       = 1

          // Manually check for update
          await handleSync()
          setSocket(generateSocket())
        }
      }, 10000)
    }

    ws.onclose = (e) => {
      Logger.debug(`SOCKET CLOSE: ${JSON.stringify(e)}`);
    }

    return ws
  }

  // ------------------ EFFECT --------------------

  // Check device screen on/off
  useEffect(() => {
    AppState.addEventListener("change", _handleAppStateChange)
    return () => {
      AppState.removeEventListener("change", _handleAppStateChange)
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
    if (!uiStore.isOffline && user.isLoggedInPw) {
      handleSync()
      handleUserDataSync()
    }
  }, [uiStore.isOffline, user.isLoggedInPw])

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
      navigation.navigate('dataOutdated')
    })
    return () => {
      EventBus.removeListener(listener)
    }
  }, [])

  // ------------------ RENDER --------------------
  
  return (
    <UserInactivity
      timeForInactivity={(user.appTimeout && (user.appTimeout > 0)) ? user.appTimeout : 1000}
      onAction={handleInactive}
    >
      <Stack.Navigator
        initialRouteName="start"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="start" component={StartScreen} />
        <Stack.Screen name="switchDevice" component={SwitchDeviceScreen} />
        <Stack.Screen name="biometricUnlockIntro" component={BiometricUnlockIntroScreen} />

        <Stack.Screen name="dataOutdated" component={DataOutdatedScreen} />

        <Stack.Screen name="mainTab" component={MainTabNavigator} />
        <Stack.Screen name="healthStack" component={HealthNavigator} />

        {/* Inner screens */}
        <Stack.Screen name="countrySelector" component={CountrySelectorScreen} />

        <Stack.Screen 
          name="passwordGenerator" 
          component={PasswordGeneratorScreen} 
          initialParams={{ fromTools: false }}
          options={{
            gestureEnabled: false
          }}
        />
        <Stack.Screen name="qrScanner" component={QRScannerScreen} />
        <Stack.Screen name="authenticator__edit" component={AuthenticatorEditScreen} initialParams={{ mode: 'add' }} />
        <Stack.Screen name="googleAuthenticatorImport" component={GoogleAuthenticatorImportScreen} />

        <Stack.Screen name="dataBreachScanner" component={DataBreachScannerScreen} />
        <Stack.Screen name="dataBreachList" component={DataBreachListScreen} />
        <Stack.Screen name="dataBreachDetail" component={DataBreachDetailScreen} />

        <Stack.Screen name="passwords__info" component={PasswordInfoScreen} />
        <Stack.Screen name="passwords__edit" component={PasswordEditScreen} initialParams={{ mode: 'add' }} />
        <Stack.Screen name="notes__info" component={NoteInfoScreen} />
        <Stack.Screen name="notes__edit" component={NoteEditScreen} initialParams={{ mode: 'add' }} />
        <Stack.Screen name="cards__info" component={CardInfoScreen} />
        <Stack.Screen name="cards__edit" component={CardEditScreen} initialParams={{ mode: 'add' }} />
        <Stack.Screen name="identities__info" component={IdentityInfoScreen} />
        <Stack.Screen name="identities__edit" component={IdentityEditScreen} initialParams={{ mode: 'add' }} />
        <Stack.Screen name="folders__select" component={FolderSelectScreen} initialParams={{ mode: 'add' }} />
        <Stack.Screen name="folders__ciphers" component={FolderCiphersScreen} />
        <Stack.Screen name="shareMultiple" component={ShareMultipleScreen} />
        <Stack.Screen name="cryptoAccounts__info" component={CryptoAccountInfoScreen} />
        <Stack.Screen name="cryptoAccounts__edit" component={CryptoAccountEditScreen} initialParams={{ mode: 'add' }} />
        <Stack.Screen name="cryptoWallets__info" component={CryptoWalletInfoScreen} />
        <Stack.Screen name="cryptoWallets__edit" component={CryptoWalletEditScreen} initialParams={{ mode: 'add' }} />

        <Stack.Screen name="invite_member" component={InviteMemberScreen} />
        <Stack.Screen name="manage_plan" component={ManagePlanScreen} />
        <Stack.Screen name="payment" component={PaymentScreen}  initialParams={{ benefitTab: 0 }} />
        <Stack.Screen name="settings" component={SettingsScreen} />
        <Stack.Screen name="changeMasterPassword" component={ChangeMasterPasswordScreen} />
        <Stack.Screen name="help" component={HelpScreen} />
        <Stack.Screen name="autofillService" component={AutofillServiceScreen} />
        <Stack.Screen name="import" component={ImportScreen} />
        <Stack.Screen name="export" component={ExportScreen} />
        <Stack.Screen name="notificationSettings" component={NotificationSettingsScreen} />

        <Stack.Screen name="autofill" component={AutoFillScreen} />
      </Stack.Navigator>
    </UserInactivity>
  )
})

/**
 * A list of routes from which we're allowed to leave the app when
 * the user presses the back button on Android.
 *
 * Anything not on this list will be a standard `back` action in
 * react-navigation.
 *
 * `canExit` is used in ./app/app.tsx in the `useBackButtonHandler` hook.
 */
const exitRoutes = []
export const canExit = (routeName: string) => exitRoutes.includes(routeName)
