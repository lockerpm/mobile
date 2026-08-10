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
import { KdfType } from "core/enums/kdfType"

import { useAppLocale } from "@/i18n"
import { usePushNotifier } from "@/services/hook/usePushnotifier"
import { MPEncodeConfig } from "@/static/types"
import { isAndroidAutofillService } from "@/utils/autofill.android"

import { BusinessLockByPasswordless } from "./business"
import { LockByMasterPassword } from "./normal"
import { OnPremiseLockByPasswordless, OnPremiseLockMasterPassword } from "./onPremise"
import { usePushNotifionData } from "./usePushNotificationData"
import { useUnlockNavigation } from "./useUnlockNavigation"

const IS_IOS = Platform.OS === "ios"

export const LockScreen: FC<AppScreenProps<"lock">> = observer(
  ({ navigation, route: { params } }) => {
    const { translate } = useAppLocale()
    const { user, enterpriseStore } = useStores()
    const { cryptoService } = useCoreService()
    const { boostrapPushNotifier } = usePushNotifier()
    const { parsePushNotiDataAndNavigateToTargetScreen } = usePushNotifionData()
    const { logout, biometricLogin } = useAuthentication()
    const {
      navigateToIntroIfNeeded,
      navigateToAndroidAutofillSetupIfNeeded,
      navigateToAuthenticatorSetupIfNeeded,
    } = useUnlockNavigation()

    // ---------------------- PARAMS -------------------------

    const [lockConfig, setLockConfig] = useState<
      {
        isLoading: boolean
        login_method: LoginMethod
      } & MPEncodeConfig
    >({
      isLoading: true,
      login_method: LoginMethod.PASSWORD,
      kdf: KdfType.PBKDF2_SHA256,
      kdf_iterations: 100000,
    })
    const { biometryType, hasDevicePasscode } = useBiometricType()
    const [isUnlocking, setIsUnlocking] = useState(false)

    // ---------------------- COMPUTED -------------------------

    const fido2 = "fido2" in params ? params.fido2 : undefined
    const otpauthLabel = params.label
    const isAndroidService = isAndroidAutofillService(fido2)
    // ---------------------- METHODS -------------------------

    const fetchLockType = async () => {
      if (params.type === LockType.Individual) {
        const res = await user.preLogin()
        if (res.kind === "ok") {
          setLockConfig({
            isLoading: false,
            login_method: res.data.login_method,
            kdf: res.data.kdf,
            kdf_iterations: res.data.kdf_iterations,
            kdf_memory: res.data.kdf_memory ?? 0,
            kdf_parallelism: res.data.kdf_parallelism ?? 0,
            kdf_version: res.data.kdf_version ?? 0,
          })
        }
      } else {
        if (params.data.login_method !== LoginMethod.PASSWORD) {
          setLockConfig({
            isLoading: false,
            login_method: LoginMethod.PASSWORDLESS,
            kdf: 0,
            kdf_iterations: 600000,
          })
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

    const refreshFCM = async () => {
      const token = await boostrapPushNotifier()
      console.log("refreshFCM token", token)
      if (token) {
        user.updateFCM(token)
      }
    }

    const handleUnlock = async () => {
      logFirebaseEvent(AnalyticEvents.ENTER_MASTER_PW, user.email ?? "")
      if (!params.temporaryLock) {
        const connectionState = await NetInfo.fetch()
        // Sync
        if (connectionState.isConnected) {
          // Refresh FCM
          refreshFCM()

          // Sync teams and plan
          if (!isAndroidService) {
            await user.loadPlan()
          }
        }

        // Parse push noti data
        if (parsePushNotiDataAndNavigateToTargetScreen()) {
          return
        }

        if (!isAndroidService) {
          if (
            !user.isBiometricUnlock &&
            (biometryType !== BiometricsType.None || hasDevicePasscode)
          ) {
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

    const handleUnlockBiometric = async (lockConfig: MPEncodeConfig) => {
      const key = await cryptoService.getKey()
      if (!key) return
      setIsUnlocking(true)
      const res = await biometricLogin(lockConfig)
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
      if (lockConfig.isLoading) return undefined
      const focusHandler = navigation.addListener("focus", () => {
        if (user.isBiometricUnlock && (biometryType !== BiometricsType.None || hasDevicePasscode)) {
          handleUnlockBiometric({
            kdf: lockConfig.kdf,
            kdf_iterations: lockConfig.kdf_iterations,
          })
        }
      })

      const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBack)
      return () => {
        backHandler.remove()
        focusHandler()
      }
    }, [navigation, lockConfig])

    // ---------------------- RENDER -------------------------
    const commonProps = {
      handleLogout,
      handleUnlock,
      isUnlocking,
      setIsUnlocking,
      biometryType,
      hasDevicePasscode,
      lockConfig,
    }

    if (params.type === LockType.OnPremise) {
      if (lockConfig.login_method === LoginMethod.PASSWORD) {
        return (
          <OnPremiseLockMasterPassword data={params.data} email={params.email} {...commonProps} />
        )
      }
      return <OnPremiseLockByPasswordless {...commonProps} />
    }

    if (lockConfig.login_method === LoginMethod.PASSWORDLESS) {
      return <BusinessLockByPasswordless {...commonProps} />
    }

    return <LockByMasterPassword fido2={fido2} {...commonProps} />
  }
)
