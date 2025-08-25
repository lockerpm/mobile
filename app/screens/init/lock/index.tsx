import { FC, useEffect, useState } from "react"
import { Alert, BackHandler, Platform } from "react-native"
import { useStores } from "app/models"
import { api } from "app/services/api"
import { useAuthentication } from "app/services/hook"
import { BiometricsType, LockType, LoginMethod } from "app/static/types/enum"
import NetInfo from "@react-native-community/netinfo"
import { LockByMasterPassword } from "./normal"
import { BusinessLockByPasswordless } from "./business"
import { OnPremiseLockByPasswordless, OnPremiseLockMasterPassword } from "./onPremise"
import { observer } from "mobx-react-lite"
import { AppScreenProps } from "app/navigators/navigators.types"
import { CommonActions } from "@react-navigation/native"
import {
  androidAutofillServiceData,
  AndroidAutofillServiceType,
  isAndroidAutofillService,
} from "app/utils/autofillHelper"
import { AnalyticEvents, logFirebaseEvent } from "app/utils/analytics"
import { useBiometricType } from "app/services/utils"
import { useCoreService } from "app/services/coreService"
import { useAppLocale } from "@/i18n"
import { CipherType } from "core/enums"

const IS_IOS = Platform.OS === "ios"

export const LockScreen: FC<AppScreenProps<"lock">> = observer(({ navigation, route }) => {
  const { translate } = useAppLocale()
  const { user, uiStore, enterpriseStore } = useStores()
  const { cryptoService } = useCoreService()
  const { logout, biometricLogin } = useAuthentication()

  // ---------------------- PARAMS -------------------------

  const [lockMethod, setLogMethod] = useState<LoginMethod>(LoginMethod.PASSWORD)
  const { biometryType } = useBiometricType()
  const [isUnlocking, setIsUnlocking] = useState(false)
  // ---------------------- COMPUTED -------------------------

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

      if (route.params.email) {
        user.setOnPremaiseEmail(route.params.email)
      }
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
      })
    )
  }

  const handleBack = () => {
    if (!IS_IOS && isAndroidAutofillService) {
      BackHandler.exitApp()
      return false
    }
    Alert.alert(translate("alert:logout") + user.email + "?", "", [
      {
        text: translate("common:cancel"),
        style: "cancel",
      },
      {
        text: translate("common:logout"),
        style: "destructive",
        onPress: handleLogout,
      },
    ])

    return true
  }

  const handleUnlock = async () => {
    logFirebaseEvent(AnalyticEvents.ENTER_MASTER_PW, user.email ?? "")
    if (!route.params.temporaryLock) {
      const connectionState = await NetInfo.fetch()
      // Sync
      if (connectionState.isConnected) {
        // Sync teams and plan
        if (!isAndroidAutofillService) {
          await Promise.all([user.loadTeams(), user.loadPlan()])
        }
      }

      if (!isAndroidAutofillService) {
        if (
          (!user.biometricIntroShown || uiStore.isStartFromPasswordLess) &&
          !user.isBiometricUnlock
        ) {
          uiStore.setStartFromPasswordLess(false)
          if (biometryType !== BiometricsType.None) {
            navigation.replace("authStack", {
              screen: "homeStack",
              params: {
                screen: "biometricUnlockIntro",
              },
            })
            return
          }
        }
      }

      // Done -> navigate
      if (isAndroidAutofillService && !!androidAutofillServiceData) {
        const data = androidAutofillServiceData
        if (data.type === AndroidAutofillServiceType.SAVE_REQUEST) {
          navigation.replace("authStack", {
            screen: "browseStack",
            params: {
              screen: "cipherEdit",
              params: {
                cipherType: CipherType.Login,
                mode: "add",
                initialUrl: data.domain,
                androidAutofillSavedData: data,
              },
            },
          })
        } else {
          navigation.replace("authStack", {
            screen: "androidAutofillStack",
            params: {
              screen: "passwordList",
              params: {
                data,
              },
            },
          })
        }
        return
      }
      if (enterpriseStore.isEnterpriseInvitations) {
        navigation.replace("authStack", {
          screen: "homeStack",
          params: { screen: "enterpriseInvited" },
        })
        return
      }
      navigation.replace("authStack", {
        screen: "mainTab",
        params: {
          screen: "homeTab",
        },
      })
    } else {
      navigation.pop(1)
    }
  }

  const handleUnlockBiometric = async () => {
    const key = await cryptoService.getKey()
    if (!key) return
    setIsUnlocking(true)
    const res = await biometricLogin()
    if (res.kind === "ok") {
      handleUnlock()
    }
    setIsUnlocking(false)
  }

  // -------------- EFFECT ------------------

  // Auto trigger face id / touch id + detect biometry type
  useEffect(() => {
    if (!isAndroidAutofillService) {
      fetchLockType()
    }
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
    handleLogout,
    handleUnlock,
    isUnlocking,
    setIsUnlocking,
    biometryType,
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
