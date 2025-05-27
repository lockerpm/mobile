import React, { FC, useEffect, useState } from "react"
import { Alert, BackHandler, Platform } from "react-native"
import { useStores } from "app/models"
import { api } from "app/services/api"
import { useAuthentication, useCipherData } from "app/services/hook"
import { BiometricsType, LockType, LoginMethod } from "app/static/types/enum"
import NetInfo from "@react-native-community/netinfo"
import { LockByMasterPassword } from "./normal/MasterPassword"
import { BusinessLockByPasswordless } from "./business/BusinessPasswordless"
import { OnPremiseLockByPasswordless, OnPremiseLockMasterPassword } from "./onPremise"
import { observer } from "mobx-react-lite"
import { RootStackScreenProps } from "app/navigators/navigators.types"
import { CommonActions } from "@react-navigation/native"
import { AndroidAutofillServiceType } from "app/utils/autofillHelper"
import { AnalyticEvents, logFirebaseEvent } from "app/utils/analytics"
import { useBiometricType } from "app/services/utils"
import { useAppLocale } from "app/services/context"
import { useCoreService } from "app/services/coreService"

const IS_IOS = Platform.OS === "ios"

export const LockScreen: FC<RootStackScreenProps<"lock">> = observer(({ navigation, route }) => {
  const { translate } = useAppLocale()
  const { user, uiStore, enterpriseStore } = useStores()
  const { cryptoService } = useCoreService()
  const { logout, biometricLogin } = useAuthentication()
  const { loadFolders, loadCollections, loadOrganizations } = useCipherData()

  // ---------------------- PARAMS -------------------------

  const [lockMethod, setLogMethod] = useState<LoginMethod>(LoginMethod.PASSWORD)
  const { biometryType } = useBiometricType()

  // ---------------------- COMPUTED -------------------------

  const isAutofillAnroid = uiStore.isAndroidAutofillService

  // ---------------------- METHODS -------------------------

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

  const handleUnlock = async () => {
    logFirebaseEvent(AnalyticEvents.ENTER_MASTER_PW, user.email)
    if (!route.params.temporaryLock) {
      const connectionState = await NetInfo.fetch()
      // Sync
      if (connectionState.isConnected) {
        // Sync teams and plan
        if (!isAutofillAnroid) {
          await Promise.all([user.loadTeams(), user.loadPlan()])
          Promise.all([loadFolders(), loadCollections(), loadOrganizations()])
        }
      }

      if (!isAutofillAnroid) {
        if (
          (!user.biometricIntroShown || uiStore.isStartFromPasswordLess) &&
          !user.isBiometricUnlock
        ) {
          uiStore.setStartFromPasswordLess(false)
          if (biometryType !== BiometricsType.None) {
            navigation.replace("mainStack", { screen: "biometricUnlockIntro" })
            return
          }
        }
      }

      // Done -> navigate
      if (isAutofillAnroid) {
        const data = uiStore.androidAutofillServiceData
        if (data.type === AndroidAutofillServiceType.SAVE_REQUEST) {
          navigation.replace("mainStack", {
            screen: "passwords__edit",
            params: { mode: "add", androidAutofillSavedData: data },
          })
        } else {
          navigation.replace("mainStack", { screen: "autofill", params: { data } })
        }
        return
      }

      if (enterpriseStore.isEnterpriseInvitations) {
        navigation.replace("mainStack", { screen: "enterpriseInvited" })
      } else {
        navigation.replace("mainStack", { screen: "mainTab" })
      }
    } else {
      navigation.pop(1)
    }
  }

  const handleUnlockBiometric = async () => {
    const key = await cryptoService.getKey()
    if (!key) return

    const res = await biometricLogin()
    if (res.kind === "ok") {
      handleUnlock()
    }
  }

  // -------------- EFFECT ------------------

  // Auto trigger face id / touch id + detect biometry type
  useEffect(() => {
    fetchLockType()
  }, [])

  // // Handle back press
  useEffect(() => {
    const focusHandler = navigation.addListener("focus", () => {
      if (user.isBiometricUnlock) {
        handleUnlockBiometric()
      }
    })

    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBack)
    return () => {
      backHandler.remove()
      focusHandler()
    }
  }, [navigation])

  // ---------------------- RENDER -------------------------
  const commonProps = {
    biometryType,
    handleLogout,
    handleUnlock,
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
