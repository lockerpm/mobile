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
  SwitchDeviceScreen,
  StartScreen,
  BiometricUnlockIntroScreen,
  PasswordEditScreen,
  PasswordInfoScreen,
  ApiCipherEditScreen,
  ApiCipherInfoScreen,
  CitizenIDEditScreen,
  CitizenIDInfoScreen,
  DatabaseEditScreen,
  DatabaseInfoScreen,
  DriverLicenseEditScreen,
  DriverLicenseInfoScreen,
  PassportEditScreen,
  PassportInfoScreen,
  ServerEditScreen,
  ServerInfoScreen,
  SocialSecurityNumberEditScreen,
  SocialSecurityNumberInfoScreen,
  WirelessRouterEditScreen,
  WirelessRouterInfoScreen,
  FolderSelectScreen,
  PasswordGeneratorScreen,
  DataBreachScannerScreen,
  NoteEditScreen,
  CardEditScreen,
  IdentityEditScreen,
  CountrySelectorScreen,
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
  WelcomePremiumScreen,
  AutoFillScreen,
  NotificationSettingsScreen,
  ShareMultipleScreen,
  PaymentScreen,
  ManagePlanScreen,
  InviteMemberScreen,
  DataOutdatedScreen,
  ReferFriendScreen,
  FolderSharedUsersManagementScreen,
  PushEmailSettingsScreen,
  PushNotificationSettingsScreen,
  InAppListNotification,
  InAppNotificationScreen,
  DeleteScreen,
  PrivateRelay,
  ManageSubdomainScreen,
  EmergencyAccessScreen,
  YourTrustedContactScreen,
  ContactsTrustedYouScreen,
  ViewEAScreen,
  TakeoverEAScreen,
  // @ts-ignore
  AutofillServiceScreen,
  AliasStatisticScreen,
  EnterpriseInvitedScreen,
  NormalSharesScreen,
} from "../screens"
import UserInactivity from "react-native-user-inactivity"
import { useMixins } from "../services/mixins"
import { useNavigation } from "@react-navigation/native"
import { AppTimeoutType, TimeoutActionType, useStores } from "../models"
import { observer } from "mobx-react-lite"
import { useCipherAuthenticationMixins } from "../services/mixins/cipher/authentication"
import { useCipherDataMixins } from "../services/mixins/cipher/data"
import { CF_ACCESS_CLIENT_ID, CF_ACCESS_CLIENT_SECRET, IS_IOS, WS_URL } from "../config/constants"
import { Logger } from "../utils/logger"
import { SocketEvent, SocketEventType } from "../config/types"
import { HealthNavigator } from "./tools/health-navigator"
import { AppEventType, EventBus } from "../utils/event-bus"
import InAppReview from "react-native-in-app-review"
import Intercom from "@intercom/intercom-react-native"
import { AppNotification } from "../services/api"
import { RelayAddress, SubdomainData, TrustedContact } from "../config/types/api"
import { CollectionView } from "../../core/models/view/collectionView"
import { CipherView } from "../../core/models/view"

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

  enterpriseInvited: undefined
  switchDevice: undefined
  biometricUnlockIntro: undefined
  privateRelay: undefined
  manageSubdomain: {
    subdomain: SubdomainData
  }
  aliasStatistic: {
    alias: RelayAddress
  }
  passwordGenerator: {
    fromTools?: boolean
  }
  authenticator__edit: {
    mode: "add" | "edit"
  }
  qrScanner: {
    totpCount?: number
  }
  dataBreachScanner: undefined
  dataBreachList: undefined
  dataBreachDetail: undefined
  countrySelector: undefined

  normal_shares: {
    ciphers?: CipherView[]
  }
  passwords__info: undefined
  passwords__edit: {
    mode: "add" | "edit" | "clone"
    initialUrl?: string
    collection?: CollectionView
  }
  notes__info: undefined
  notes__edit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }
  cards__info: undefined
  cards__edit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }
  identities__info: undefined
  identities__edit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }
  driverLicenses__info: undefined
  driverLicenses__edit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }
  citizenIDs__info: undefined
  citizenIDs__edit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }
  passports__info: undefined
  passports__edit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }
  socialSecurityNumbers__info: undefined
  socialSecurityNumbers__edit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }
  wirelessRouters__info: undefined
  wirelessRouters__edit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }
  servers__info: undefined
  servers__edit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }
  apiCiphers__info: undefined
  apiCiphers__edit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }
  databases__info: undefined
  databases__edit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }
  folders__select: {
    mode: "add" | "move"
    initialId?: string
    cipherIds?: string[]
  }
  folders__ciphers: {
    folderId?: string | null
    collectionId?: string | null
    organizationId?: string | null
  }
  shareFolder: {
    collectionId: string
  }
  manage_plan: undefined
  payment: {
    benefitTab?: 0 | 1 | 2 | 3
    family?: boolean
    premium?: boolean
  }
  refer_friend: {
    referLink: string | null
  }
  invite_member: undefined
  settings: undefined
  changeMasterPassword: undefined
  help: undefined
  autofillService: undefined
  import: undefined
  export: undefined
  autofill: {
    mode: "all" | "item"
  }
  notificationSettings: undefined
  emailNotiSettings: undefined
  deviceNotiSettings: undefined
  deleteAccount: undefined
  shareMultiple: undefined
  cryptoWallets__info: undefined
  cryptoWallets__edit: {
    mode: "add" | "edit" | "clone"
    collection?: CollectionView
  }
  welcome_premium: undefined

  app_list_noti: {
    notifications: AppNotification
  }
  app_noti: undefined

  emergencyAccess: undefined
  yourTrustedContact: undefined
  contactsTrustedYou: undefined
  viewEA: {
    trusted: TrustedContact
  }
  takeoverEA: {
    trusted: TrustedContact
    reset_pw: boolean
  }
}

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createStackNavigator<PrimaryParamList>()

export const MainNavigator = observer(() => {
  const navigation = useNavigation()
  const { notify, translate, parsePushNotiData } = useMixins()
  const { lock, logout } = useCipherAuthenticationMixins()
  const {
    getCipherById,
    syncAutofillData,
    syncSingleCipher,
    syncSingleFolder,
    syncOfflineData,
    startSyncProcess,
  } = useCipherDataMixins()
  const { uiStore, user, cipherStore, toolStore } = useStores()

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
    if (syncRes.kind !== "ok") {
      if (syncRes.kind === "error") {
        notify("error", translate("error.sync_failed"))
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
    Logger.debug(nextAppState)

    // Ohter state (background/inactive)
    if (nextAppState !== "active") {
      appIsActive = false
      return
    }

    // Sync autofill data on iOS
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
          navigation.navigate("loginSelect")
        } else {
          await lock()
          navigation.navigate("lock")
        }
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
  }

  // App inactive trigger
  const handleInactive = async (isActive: boolean) => {
    if (!isActive && user.appTimeout && user.appTimeout > 0) {
      if (user.appTimeoutAction === TimeoutActionType.LOGOUT) {
        await logout()
        navigation.navigate("loginSelect")
      } else {
        await lock()
        navigation.navigate("lock")
      }
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
  // Intercom support
  useEffect(() => {
    const registerIntercomUser = async () => {
      if (user.isLoggedInPw) {
        try {
          await Intercom.registerIdentifiedUser({ email: user.email, userId: user.pwd_user_id })
          Intercom.updateUser({ name: user.full_name || user.username })
        } catch (error) {
          Logger.error(error)
        }
      }
    }
    registerIntercomUser()
  }, [user.isLoggedInPw])

  // check app revire
  useEffect(() => {
    requestInAppReview()
  }, [])

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
        <Stack.Screen name="switchDevice" component={SwitchDeviceScreen} />
        <Stack.Screen name="biometricUnlockIntro" component={BiometricUnlockIntroScreen} />

        <Stack.Screen name="dataOutdated" component={DataOutdatedScreen} />

        <Stack.Screen name="mainTab" component={MainTabNavigator} />
        <Stack.Screen name="healthStack" component={HealthNavigator} />
        {/* Inner screens */}
        <Stack.Screen name="countrySelector" component={CountrySelectorScreen} />

        <Stack.Screen name="app_list_noti" component={InAppListNotification} />
        <Stack.Screen name="app_noti" component={InAppNotificationScreen} />

        <Stack.Screen
          name="passwordGenerator"
          component={PasswordGeneratorScreen}
          initialParams={{ fromTools: false }}
          options={{
            gestureEnabled: false,
          }}
        />

        <Stack.Screen name="privateRelay" component={PrivateRelay} />
        <Stack.Screen name="manageSubdomain" component={ManageSubdomainScreen} />
        <Stack.Screen name="aliasStatistic" component={AliasStatisticScreen} />
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

        <Stack.Screen name="passwords__info" component={PasswordInfoScreen} />
        <Stack.Screen
          name="passwords__edit"
          component={PasswordEditScreen}
          initialParams={{ mode: "add" }}
        />
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
        <Stack.Screen name="driverLicenses__info" component={DriverLicenseInfoScreen} />
        <Stack.Screen
          name="driverLicenses__edit"
          component={DriverLicenseEditScreen}
          initialParams={{ mode: "add" }}
        />
        <Stack.Screen name="citizenIDs__info" component={CitizenIDInfoScreen} />
        <Stack.Screen
          name="citizenIDs__edit"
          component={CitizenIDEditScreen}
          initialParams={{ mode: "add" }}
        />
        <Stack.Screen name="passports__info" component={PassportInfoScreen} />
        <Stack.Screen
          name="passports__edit"
          component={PassportEditScreen}
          initialParams={{ mode: "add" }}
        />
        <Stack.Screen
          name="socialSecurityNumbers__info"
          component={SocialSecurityNumberInfoScreen}
        />
        <Stack.Screen
          name="socialSecurityNumbers__edit"
          component={SocialSecurityNumberEditScreen}
          initialParams={{ mode: "add" }}
        />
        <Stack.Screen name="wirelessRouters__info" component={WirelessRouterInfoScreen} />
        <Stack.Screen
          name="wirelessRouters__edit"
          component={WirelessRouterEditScreen}
          initialParams={{ mode: "add" }}
        />
        <Stack.Screen name="servers__info" component={ServerInfoScreen} />
        <Stack.Screen
          name="servers__edit"
          component={ServerEditScreen}
          initialParams={{ mode: "add" }}
        />
        <Stack.Screen name="apiCiphers__info" component={ApiCipherInfoScreen} />
        <Stack.Screen
          name="apiCiphers__edit"
          component={ApiCipherEditScreen}
          initialParams={{ mode: "add" }}
        />
        <Stack.Screen name="databases__info" component={DatabaseInfoScreen} />
        <Stack.Screen
          name="databases__edit"
          component={DatabaseEditScreen}
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

        <Stack.Screen name="refer_friend" component={ReferFriendScreen} />
        <Stack.Screen name="invite_member" component={InviteMemberScreen} />
        <Stack.Screen name="manage_plan" component={ManagePlanScreen} />
        <Stack.Screen name="payment" component={PaymentScreen} initialParams={{ benefitTab: 0 }} />
        <Stack.Screen name="settings" component={SettingsScreen} />
        <Stack.Screen name="changeMasterPassword" component={ChangeMasterPasswordScreen} />
        <Stack.Screen name="help" component={HelpScreen} />
        <Stack.Screen name="autofillService" component={AutofillServiceScreen} />
        <Stack.Screen name="import" component={ImportScreen} />
        <Stack.Screen name="export" component={ExportScreen} />
        <Stack.Screen name="deleteAccount" component={DeleteScreen} />
        <Stack.Screen name="notificationSettings" component={NotificationSettingsScreen} />
        <Stack.Screen name="emailNotiSettings" component={PushEmailSettingsScreen} />
        <Stack.Screen name="deviceNotiSettings" component={PushNotificationSettingsScreen} />

        <Stack.Screen name="welcome_premium" component={WelcomePremiumScreen} />
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
