import React, { FC, useEffect, useState } from "react"
import { Alert, BackHandler, Platform, View } from "react-native"
import { useStores } from "app/models"
import { api } from "app/services/api"
import { translate } from "app/i18n"
import { useAuthentication } from "app/services/hook"
import { RootStackScreenProps } from "app/navigators"
import ReactNativeBiometrics from "react-native-biometrics"
import { BiometricsType, LockType } from "./lock.types"
import { LoginMethod } from "app/static/types/enum"

import { LockByMasterPassword } from "./normal/MasterPassword"
import { BusinessLockByPasswordless } from "./business/BusinessPasswordless"
import { OnPremiseLockByPasswordless } from "./onPremise/passwordless/passwordless"
import { OnPremiseLockMasterPassword } from "./onPremise/onpremise-master-password"

const IS_IOS = Platform.OS === 'ios'

export const LockScreen: FC<RootStackScreenProps<'lock'>> = (props) => {
  const navigation = props.navigation
  const route = props.route
  const { user, uiStore } = useStores()
  const { logout } = useAuthentication()

  // ---------------------- PARAMS -------------------------

  const [lockMethod, setLogMethod] = useState<LoginMethod>(LoginMethod.PASSWORD)
  const [biometryType, setBiometryType] = useState<BiometricsType>(BiometricsType.Biometrics)


  // ---------------------- COMPUTED -------------------------

  const isAutofillAnroid =
    uiStore.isFromAutoFill || uiStore.isOnSaveLogin || uiStore.isFromAutoFillItem

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

  const fetchBusinessLoginMethod = async () => {
    if (route.params.type === LockType.Individual) {
      const res = await user.businessLoginMethod()
      if (res.kind === "ok") {
        setLogMethod(res.data.login_method)
      }
    }
  }

  const fetchLockType = () => {
    // Om Premise setup
    if (route.params.type === LockType.OnPremise) {
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
    navigation.replace("login")
  }


  // -------------- EFFECT ------------------

  // Auto trigger face id / touch id + detect biometry type
  useEffect(() => {
    detectbiometryType()
    fetchBusinessLoginMethod()
    fetchLockType()
  }, [])

  // Handle back press
  useEffect(() => {
    const handleBack = (e) => {
      if (!["POP", "GO_BACK"].includes(e.data.action.type)) {
        navigation.dispatch(e.data.action)
        return
      }
      e.preventDefault()

      if (!IS_IOS && isAutofillAnroid) {
        BackHandler.exitApp()
        return
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
    }
    navigation.addListener("beforeRemove", handleBack)
    return () => {
      navigation.removeListener("beforeRemove", handleBack)
    }
  }, [navigation])

  // ---------------------- RENDER -------------------------

  const renderContent = () => {
    const commonProps = {
      biometryType,
      handleLogout,
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

    if (lockMethod === LoginMethod.PASSWORD) {
      return <LockByMasterPassword {...commonProps} />
    }
    return <BusinessLockByPasswordless {...commonProps} />
  }

  return <View style={{ flex: 1 }}>{renderContent()}</View>
}
