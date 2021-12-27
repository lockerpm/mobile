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
  PasswordInfoScreen , FolderSelectScreen, PasswordGeneratorScreen, PasswordHealthScreen,
  DataBreachScannerScreen, NoteEditScreen, CardEditScreen, IdentityEditScreen,
  CountrySelectorScreen, SettingsScreen, ChangeMasterPasswordScreen, HelpScreen,
  CardInfoScreen, IdentityInfoScreen, NoteInfoScreen, FolderCiphersScreen, DataBreachDetailScreen,
  DataBreachListScreen, WeakPasswordList, ReusePasswordList, ExposedPasswordList,
  ImportScreen, ExportScreen, QRScannerScreen, AuthenticatorEditScreen,
  GoogleAuthenticatorImportScreen, AutoFillScreen
} from "../screens"
// @ts-ignore
import { AutofillServiceScreen } from "../screens"
import UserInactivity from "react-native-user-inactivity"
import { useMixins } from "../services/mixins"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../models"
import { observer } from "mobx-react-lite"
import { useCipherAuthenticationMixins } from "../services/mixins/cipher/authentication"
import { useCipherDataMixins } from "../services/mixins/cipher/data"
import { useCipherToolsMixins } from "../services/mixins/cipher/tools"

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
  start: undefined
  switchDevice: undefined
  biometricUnlockIntro: undefined
  mainTab: undefined
  passwordGenerator: {
    fromTools?: boolean
  }
  authenticator__edit: {
    mode: 'add' | 'edit'
  }
  qrScanner: undefined
  googleAuthenticatorImport: undefined
  passwordHealth: undefined
  weakPasswordList: undefined
  reusePasswordList: undefined
  exposedPasswordList: undefined
  dataBreachScanner: undefined
  dataBreachList: undefined
  dataBreachDetail: undefined
  countrySelector: undefined
  passwords__info: undefined
  passwords__edit: {
    mode: 'add' | 'edit' | 'clone'
    initialUrl?: string
  }
  notes__info: undefined,
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
  settings: {
    fromIntro?: boolean
  }
  changeMasterPassword: undefined
  help: undefined
  autofillService: undefined
  import: undefined
  export: undefined
  autofill: undefined
}

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createStackNavigator<PrimaryParamList>()

export const MainNavigator = observer(function MainNavigator() {
  const navigation = useNavigation()
  const { notify, translate } = useMixins()
  const { lock, logout } = useCipherAuthenticationMixins()
  const { getSyncData, getCipherById, loadFolders, loadCollections, syncAutofillData } = useCipherDataMixins()
  const { loadPasswordsHealth } = useCipherToolsMixins()
  const { uiStore, user, cipherStore } = useStores()

  let appIsActive = true
  let isSynchingAutofill = false
  const [socket, setSocket] = useState(null)
  const [appIsReady, setAppIsReady] = useState(false)

  // ------------------ METHODS --------------------

  // Sync
  const handleSync = async () => {
    const lastUpdateRes = await user.getLastUpdate()
    if (lastUpdateRes.kind === 'ok' && lastUpdateRes.data.revision_date * 1000 <= user.lastSync) {
      return
    }

    const syncRes = await getSyncData()
    if (syncRes.kind === 'ok') {
      notify('success', translate('success.sync_success'))
      user.setLastSync(Date.now())
    } else {
      if (syncRes.kind !== 'synching') {
        notify('error', translate('error.sync_failed'))
      }
    }

    await Promise.all([
      loadFolders(),
      loadCollections()
    ])
    if (cipherStore.selectedCipher) {
      const updatedCipher = await getCipherById(cipherStore.selectedCipher.id)
      cipherStore.setSelectedCipher(updatedCipher)
    }
    user.loadTeams(),
    user.loadPlan()
    loadPasswordsHealth()
  }

  // Check invitation
  const handleInvitationSync = async () => {
    const invitationsRes = await user.getInvitations()
    if (invitationsRes.kind === 'ok') {
      user.setInvitations(invitationsRes.data)
    }
  }

  // App screen lock trigger
  const _handleAppStateChange = async (nextAppState: string) => {
    __DEV__ && console.log(nextAppState)

    // Ohter state (background/inactive)
    if (nextAppState === 'background') {
      appIsActive = false
      return
    }

    // Sync autofill data
    if (!appIsActive && !isSynchingAutofill) {
      isSynchingAutofill = true
      syncAutofillData().then(() => {
        isSynchingAutofill = false
      }).catch(e => {
        __DEV__ && console.log(e)
        isSynchingAutofill = false
      })
    }

    // Active
    if (!appIsActive && user.appTimeout && user.appTimeout === -1) {
      appIsActive = true

      // Dont lock if user just return from overlay task
      if (uiStore.isPerformOverlayTask) {
        uiStore.setIsPerformOverlayTask(false)
        return
      }

      // Check user settings to lock
      if (user.appTimeoutAction && user.appTimeoutAction === 'logout') {
        await logout()
        navigation.navigate('onBoarding')
      } else {
        await lock()
        navigation.navigate('lock')
      }
    }
  }

  // App inactive trigger
  const handleInactive = async (isActive : boolean) => {
    if (!isActive && user.appTimeout && user.appTimeout > 0) {
      if (user.appTimeoutAction && user.appTimeoutAction === 'logout') {
        await logout()
        navigation.navigate('onBoarding')
      } else {
        await lock()
        navigation.navigate('lock')
      }
    }
  }

  // Web socket
  const wsUrl = `wss://api.cystack.net/ws/cystack_platform/pm/sync?token=${user.token}`
  const generateSocket = () => {
    const ws = new WebSocket(wsUrl)
    ws.onopen = () => {
      if (__DEV__) {
        console.log('SOCKET OPEN')
      }
    }

    ws.onmessage = async (e) => {
      const data = JSON.parse(e.data)
      __DEV__ && console.log('WEBSOCKET EVENT: ' + data.event)
      switch (data.event) {
        case 'sync':
          await handleSync()
          break
        case 'members':
          await handleInvitationSync()
          break
        default:
          break
      }
    }

    ws.onerror = (e) => {
      if (__DEV__) {
        console.log(`SOCKET ERROR: ${JSON.stringify(e)}`)
      }
    }

    ws.onclose = (e) => {
      if (__DEV__) {
        console.log(`SOCKET CLOSE: ${JSON.stringify(e)}`);
      }
    }

    return ws
  }

  // ------------------ EFFECT --------------------

  // Life cycle
  useEffect(() => {
    // Check device screen on/off
    AppState.addEventListener("change", _handleAppStateChange)

    // Connect web socket
    !appIsReady && setSocket(generateSocket())

    setAppIsReady(true)

    return () => {
      AppState.removeEventListener("change", _handleAppStateChange)
      socket && socket.close()
    };
  }, []);

  // Check network to connect socket
  useEffect(() => {
    if (uiStore.isOffline) {
      socket && socket.close()
      setSocket(null)
    } else {
      if (appIsReady) {
        setSocket(generateSocket())
        handleSync()
        handleInvitationSync()
      }
    }
  }, [uiStore.isOffline])

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
        <Stack.Screen name="mainTab" component={MainTabNavigator} />

        {/* Inner screens */}
        <Stack.Screen name="countrySelector" component={CountrySelectorScreen} />

        <Stack.Screen name="passwordGenerator" component={PasswordGeneratorScreen} initialParams={{ fromTools: false }} />
        <Stack.Screen name="qrScanner" component={QRScannerScreen} />
        <Stack.Screen name="authenticator__edit" component={AuthenticatorEditScreen} initialParams={{ mode: 'add' }} />
        <Stack.Screen name="googleAuthenticatorImport" component={GoogleAuthenticatorImportScreen} />

        <Stack.Screen name="passwordHealth" component={PasswordHealthScreen} />
        <Stack.Screen name="weakPasswordList" component={WeakPasswordList} />
        <Stack.Screen name="reusePasswordList" component={ReusePasswordList} />
        <Stack.Screen name="exposedPasswordList" component={ExposedPasswordList} />

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

        <Stack.Screen name="settings" component={SettingsScreen} initialParams={{ fromIntro: false }} />
        <Stack.Screen name="changeMasterPassword" component={ChangeMasterPasswordScreen} />
        <Stack.Screen name="help" component={HelpScreen} />
        <Stack.Screen name="autofillService" component={AutofillServiceScreen} />
        <Stack.Screen name="import" component={ImportScreen} />
        <Stack.Screen name="export" component={ExportScreen} />

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
