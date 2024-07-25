import React, { FC, useEffect, useState } from "react"
import { Alert, BackHandler, Platform } from "react-native"
import { useStores } from "app/models"
import { api } from "app/services/api"
import { useAuthentication, useCipherData, useHelper } from "app/services/hook"
import ReactNativeBiometrics from "react-native-biometrics"
import { BiometricsType, LockType } from "./lock.types"
import { LoginMethod } from "app/static/types/enum"
import NetInfo from "@react-native-community/netinfo"
import { LockByMasterPassword } from "./normal/MasterPassword"
import { BusinessLockByPasswordless } from "./business/BusinessPasswordless"
import { OnPremiseLockByPasswordless } from "./onPremise/passwordless/passwordless"
import { OnPremiseLockMasterPassword } from "./onPremise/masterPassword/OnPremiseMasterPassword"
import { observer } from "mobx-react-lite"
import { RootStackScreenProps } from "app/navigators/navigators.types"
import { CommonActions } from "@react-navigation/native"
import { AndroidAutofillServiceType } from "app/utils/autofillHelper"

const IS_IOS = Platform.OS === "ios"

export const LockScreen: FC<RootStackScreenProps<"lock">> = observer((props) => {
  const navigation = props.navigation
  const route = props.route

  const { translate } = useHelper()
  const { user, uiStore, enterpriseStore } = useStores()

  const { logout } = useAuthentication()
  const { isBiometricAvailable, boostrapPushNotifier, parsePushNotiData } = useHelper()
  const { loadFolders, loadCollections, loadOrganizations } = useCipherData()

  // ---------------------- PARAMS -------------------------

  const [lockMethod, setLogMethod] = useState<LoginMethod>(LoginMethod.PASSWORD)
  const [biometryType, setBiometryType] = useState<BiometricsType>(BiometricsType.Biometrics)

  // ---------------------- COMPUTED -------------------------

  const isAutofillAnroid = uiStore.isAndroidAutofillService

  // ---------------------- METHODS -------------------------

  // Detect biometric type
  const detectbiometryType = async () => {
    const { biometryType } = await ReactNativeBiometrics.isSensorAvailable()

    if (biometryType === ReactNativeBiometrics.TouchID) {
      setBiometryType(BiometricsType.TouchID)
      return
    }

    if (biometryType === ReactNativeBiometrics.FaceID) {
      setBiometryType(BiometricsType.FaceID)
    }
  }

  const fetchLockType = async () => {
    if (route.params.type === LockType.Individual) {
      const res = await user.businessLoginMethod()
      if (res.kind === "ok") {
        setLogMethod(res.data.login_method)
      }
    } else {
      if (route.params.data.login_method !== LoginMethod.PASSWORD) {
        setLogMethod(LoginMethod.PASSWORDLESS)
        user.setPasswordlessLogin(true)
      }

      route.params.email && user.setOnPremaiseEmail(route.params.email)
      user.setOnPremiseUser(true)
      if (route.params.data?.base_api) {
        user.setOnPremiseLastBaseUrl(route.params.data.base_api + "/v3")
        api.apisauce.setBaseURL(route.params.data.base_api + "/v3")
      }
    }
  }

  const handleLogout = async () => {
    await logout()

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "init" }],
      }),
    )
  }

  const handleBack = () => {
    if (!IS_IOS && isAutofillAnroid) {
      BackHandler.exitApp()
      return false
    }
    Alert.alert(translate("alert.logout") + user.email + "?", "", [
      {
        text: translate("common.cancel"),
        style: "cancel",
      },
      {
        text: translate("common.logout"),
        style: "destructive",
        onPress: handleLogout,
      },
    ])

    return true
  }

  const refreshFCM = async () => {
    if (!user.disablePushNotifications) {
      let isSuccess = true
      if (!user.fcmToken) {
        isSuccess = await boostrapPushNotifier()
      }
      if (isSuccess) {
        user.updateFCM(user.fcmToken)
      }
    }
  }

  const handleUnlock = async () => {
    if (!route.params.temporaryLock) {
      const connectionState = await NetInfo.fetch()
      // Sync
      if (connectionState.isConnected) {
        // Refresh FCM
        refreshFCM()
  
        // Sync teams and plan
        if (!isAutofillAnroid) {
          await user.loadTeams()
          await user.loadPlan()
        }
      }
      Promise.all([loadFolders(), loadCollections(), loadOrganizations()])
      // Parse push noti data
      const navigationRequest = await parsePushNotiData()
      if (navigationRequest.path) {
        // handle navigate browse
  
        navigationRequest.tempParams &&
          // @ts-ignore TODO
          navigation.replace(navigationRequest.path, navigationRequest.tempParams)
        // @ts-ignore TODO
        navigation.replace(navigationRequest.path, navigationRequest.params)
        return
      }
  
      if (!isAutofillAnroid) {
        if (
          (!user.biometricIntroShown || uiStore.isStartFromPasswordLess) &&
          !user.isBiometricUnlock
        ) {
          uiStore.setStartFromPasswordLess(false)
          const available = await isBiometricAvailable()
          if (available) {
            navigation.replace("mainStack", { screen: "biometricUnlockIntro" })
            return
          }
        }
      }
  
      navigation.replace("mainStack", { screen: "autofill", params: { data: {
        type: AndroidAutofillServiceType.AUTOFILL,
        lastUserPasswordID: "",
        domain: "facebook.com",
        username: "",
        password: ""
    }} })
  
      // // Done -> navigate
      // if (isAutofillAnroid) {
      //   const data = uiStore.androidAutofillServiceData
      //   if (data.type === AndroidAutofillServiceType.SAVE_REQUEST) {
      //     navigation.replace("mainStack", { screen: "passwords__edit", params: {mode: "add", androidAutofillSavedData: data } })
      //   } else {
      //     navigation.replace("mainStack", { screen: "autofill", params: { data} })
      //   }
      //   return
      // }
  
      // if (uiStore.isDeeplinkEmergencyAccess) {
      //   uiStore.setIsDeeplinkEmergencyAccess(false)
      //   navigation.replace("mainStack", { screen: "mainTab", params: {  screen: "menuTab" } })
      //   navigation.replace("mainStack", { screen: "emergencyAccess" })
      // } else if (uiStore.isDeeplinkShares) {
      //   uiStore.setIsDeeplinkShares(false)
      //   navigation.replace("mainStack", { screen: "mainTab", params: {  screen: "browseTab" } })
      // } else if (enterpriseStore.isEnterpriseInvitations) {
      //   navigation.replace("mainStack", { screen: "enterpriseInvited" })
      // } else {
      //   navigation.replace("mainStack", { screen: "mainTab", params: {  screen: user.defaultTab} })
      // }
    } else {
      navigation.pop(1)  
    }
  }

  // -------------- EFFECT ------------------

  // Auto trigger face id / touch id + detect biometry type
  useEffect(() => {
    detectbiometryType()
    fetchLockType()
  }, [])

  // // Handle back press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBack,
    );
    return () => backHandler.remove();
  }, [navigation])

  // ---------------------- RENDER -------------------------
  const commonProps = {
    biometryType,
    handleLogout,
    handleUnlock
  }

  if (route.params.type === LockType.OnPremise) {
    if (lockMethod === LoginMethod.PASSWORD) {
      return (
        <OnPremiseLockMasterPassword
          data={route.params.data}
          email={route.params.email}
          {...commonProps}
        />
      )
    }
    return <OnPremiseLockByPasswordless {...commonProps} />
  }

  if (lockMethod === LoginMethod.PASSWORDLESS) {
    return <BusinessLockByPasswordless {...commonProps} />
  }

  return <LockByMasterPassword {...commonProps} />
})
