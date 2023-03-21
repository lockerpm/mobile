import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Alert, BackHandler } from "react-native"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { useStores } from "../../../models"
import { useMixins } from "../../../services/mixins"
import { useCipherAuthenticationMixins } from "../../../services/mixins/cipher/authentication"
import { IS_IOS } from "../../../config/constants"
import { LockByMasterPassword } from "./master-password"
import { RootParamList } from "../../../navigators"
import { LockByPasswordless } from "./on-premise/passwordless/passwordless"
import { OnPremiseLockMasterPassword } from "./on-premise/onpremise-master-password"
import ReactNativeBiometrics from "react-native-biometrics"

export const LockScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<RouteProp<RootParamList, "lock">>()
  const { user, uiStore } = useStores()
  const { translate } = useMixins()
  const { logout } = useCipherAuthenticationMixins()

  // ---------------------- PARAMS -------------------------
  const [lockMethod, setLogMethod] = useState<"masterpass" | "passwordless">("masterpass")
  const [biometryType, setBiometryType] = useState<"faceid" | "touchid" | "biometric">("biometric")

  // ---------------------- METHODS -------------------------

  const isAutofillAnroid =
    uiStore.isFromAutoFill || uiStore.isOnSaveLogin || uiStore.isFromAutoFillItem

  // ---------------------- METHODS -------------------------

  // Detect biometric type
  const detectbiometryType = async () => {
    const { biometryType } = await ReactNativeBiometrics.isSensorAvailable()
    if (biometryType === ReactNativeBiometrics.TouchID) {
      setBiometryType("touchid")
    } else if (biometryType === ReactNativeBiometrics.FaceID) {
      setBiometryType("faceid")
    }
  }

  const handleLogout = async () => {
    await logout()
    navigation.navigate("loginSelect")
  }

  // ---------------------- COMPONENTS -------------------------

  // -------------- EFFECT ------------------
  // Auto trigger face id / touch id + detect biometry type
  useEffect(() => {
    detectbiometryType()
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
          onPress: () => null,
        },
        {
          text: translate("common.logout"),
          style: "destructive",
          onPress: async () => {
            await logout()
            navigation.navigate("loginSelect")
          },
        },
      ])
    }
    navigation.addListener("beforeRemove", handleBack)
    return () => {
      navigation.removeListener("beforeRemove", handleBack)
    }
  }, [navigation])

  useEffect(() => {
    // Om Premise setup
    if (route.params.type === "onPremise") {
      if (route.params.data.login_method !== "password") {
        setLogMethod("passwordless")
        user.setPasswordlessLogin(true)
      }
      route.params.email && user.setOnPremaiseEmail(route.params.email)
      user.setOnPremiseUser(true)
      if (route.params.data?.base_api) {
        user.setOnPremiseLastBaseUrl(route.params.data.base_api + "/v3")
        user.environment.api.apisauce.setBaseURL(route.params.data.base_api + "/v3")

      }
    }
  }, [])
  // ---------------------- RENDER -------------------------

  if (lockMethod === "masterpass") {
    if (route.params.type === "onPremise") {
      return (
        <OnPremiseLockMasterPassword
          data={route.params.data}
          email={route.params.email}
          biometryType={biometryType}
          handleLogout={handleLogout}
        />
      )
    }
    return <LockByMasterPassword biometryType={biometryType} handleLogout={handleLogout} />
  }
  return <LockByPasswordless biometryType={biometryType} handleLogout={handleLogout} />
})
