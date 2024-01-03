import React, { FC, useEffect, useState } from "react"
import { Alert, BackHandler, Platform, View } from "react-native"
import { useStores } from "app/models"
import { useAuthentication, useHelper } from "app/services/hook"
import { RootStackScreenProps } from "app/navigators/navigators.types"
import ReactNativeBiometrics from "react-native-biometrics"
import { BiometricsType } from "./lock.types"
import { LoginMethod } from "app/static/types/enum"

import { LockByMasterPassword } from "./normal/MasterPassword"
import { BusinessLockByPasswordless } from "./business/BusinessPasswordless"
import { observer } from "mobx-react-lite"
import { CommonActions } from "@react-navigation/native"

const IS_IOS = Platform.OS === "ios"

export const LockScreen: FC<RootStackScreenProps<"lock">> = observer((props) => {
  const navigation = props.navigation
  const route = props.route

  const { translate } = useHelper()
  const { user, uiStore } = useStores()
  const { logout } = useAuthentication()

  const userEmail = user.email || route.params.email

  // ---------------------- PARAMS -------------------------

  const [lockMethod, setLogMethod] = useState<LoginMethod>(route.params.type)
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
    if (route.params.type !== LoginMethod.PASSWORDLESS) {
      const res = await user.preloginMethod(userEmail)
      if (res.kind === "ok") {
        setLogMethod(res.data.login_method)
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

  // -------------- EFFECT ------------------

  // Auto trigger face id / touch id + detect biometry type
  useEffect(() => {
    detectbiometryType()
    fetchBusinessLoginMethod()
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
      Alert.alert(translate("alert.logout") + userEmail + "?", "", [
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
      setLogMethod
    }

    if (lockMethod === LoginMethod.PASSWORD) {
      return <LockByMasterPassword {...commonProps} email={userEmail} />
    }
    return <BusinessLockByPasswordless {...commonProps} email={userEmail}  />
  }

  return <View style={{ flex: 1 }}>{renderContent()}</View>
})
