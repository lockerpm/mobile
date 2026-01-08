import { FC, useEffect, useState } from "react"
import { Alert, BackHandler, Platform } from "react-native"
import NetInfo from "@react-native-community/netinfo"
import { CommonActions } from "@react-navigation/native"
import { observer } from "mobx-react-lite"

import { useStores } from "app/models"
import { AppScreenProps } from "app/navigators/navigators.types"
import { api } from "app/services/api"
import { useCoreService } from "app/services/coreService"
import { useAuthentication } from "app/services/hook"
import { useBiometricType } from "app/services/utils"
import { BiometricsType, LockType, LoginMethod } from "app/static/types/enum"
import { AnalyticEvents, logFirebaseEvent } from "app/utils/analytics"

import { useAppLocale } from "@/i18n"
import { isAndroidAutofillService } from "@/utils/autofill.android"

import { BusinessLockByPasswordless } from "./business"
import { LockByMasterPassword } from "./normal"
import { OnPremiseLockByPasswordless, OnPremiseLockMasterPassword } from "./onPremise"
import { useUnlockNavigation } from "./useUnlockNavigation"

const IS_IOS = Platform.OS === "ios"

export const LockScreen: FC<AppScreenProps<"lock">> = observer(
  ({ navigation, route: { params } }) => {
    const { translate } = useAppLocale()
    const { user, enterpriseStore } = useStores()
    const { cryptoService } = useCoreService()
    const { logout, biometricLogin } = useAuthentication()
    const {
      navigateToIntroIfNeeded,
      navigateToAndroidAutofillSetupIfNeeded,
      navigateToAuthenticatorSetupIfNeeded,
    } = useUnlockNavigation()

    // ---------------------- PARAMS -------------------------

    const [lockMethod, setLogMethod] = useState<LoginMethod>(LoginMethod.PASSWORD)
    const { biometryType } = useBiometricType()
    const [isUnlocking, setIsUnlocking] = useState(false)
    // ---------------------- COMPUTED -------------------------

    const fido2 = "fido2" in params ? params.fido2 : undefined
    const otpauthLabel = params.label
    const isAndroidService = isAndroidAutofillService(fido2)
    // ---------------------- METHODS -------------------------

    console.log("LockScreen otpauthLabel:", otpauthLabel)

    const fetchLockType = async () => {
      if (params.type === LockType.Individual) {
        const res = await user.businessLoginMethod()
        if (res.kind === "ok") {
          setLogMethod(res.data.login_method)
        }
      } else {
        if (params.data.login_method !== LoginMethod.PASSWORD) {
          setLogMethod(LoginMethod.PASSWORDLESS)
          user.setPasswordlessLogin(true)
        }

        if (params.email) {
          user.setOnPremaiseEmail(params.email)
        }
        user.setOnPremiseUser(true)
        if (params.data?.base_api) {
          user.setOnPremiseLastBaseUrl(params.data.base_api + "/v3")
          api.apisauce.setBaseURL(params.data.base_api + "/v3")
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
      if (!IS_IOS && isAndroidService) {
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
      if (!params.temporaryLock) {
        const connectionState = await NetInfo.fetch()
        // Sync
        if (connectionState.isConnected) {
          // Sync teams and plan
          if (!isAndroidService) {
            await Promise.all([user.loadTeams(), user.loadPlan()])
          }
        }

        if (!isAndroidService) {
          if (!user.isBiometricUnlock && biometryType !== BiometricsType.None) {
            navigateToIntroIfNeeded()
            return
          }
        }
        // Done -> navigate
        if (isAndroidService) {
          navigateToAndroidAutofillSetupIfNeeded()
          return
        }
        if (enterpriseStore.isEnterpriseInvitations) {
          navigation.replace("authStack", {
            screen: "homeStack",
            params: { screen: "enterpriseInvited" },
          })
          return
        }
        if (otpauthLabel) {
          navigateToAuthenticatorSetupIfNeeded(otpauthLabel)
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
      if (!isAndroidService) {
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

    if (params.type === LockType.OnPremise) {
      if (lockMethod === LoginMethod.PASSWORD) {
        return (
          <OnPremiseLockMasterPassword data={params.data} email={params.email} {...commonProps} />
        )
      }
      return <OnPremiseLockByPasswordless {...commonProps} />
    }

    if (lockMethod === LoginMethod.PASSWORDLESS) {
      return <BusinessLockByPasswordless {...commonProps} />
    }

    return <LockByMasterPassword fido2={fido2} {...commonProps} />
  }
)
