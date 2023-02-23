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
import { LockByPasswordless } from "./passwordless"
import { OnPremiseLockMasterPassword } from "./onpremise-master-password"

export const LockScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<RouteProp<RootParamList, "lock">>()
  const { user, uiStore } = useStores()
  const { translate } = useMixins()
  const { logout } = useCipherAuthenticationMixins()

  // ---------------------- PARAMS -------------------------
  const [lockMethod, setLogMethod] = useState<"masterpass" | "passwordless">("masterpass")

  // ---------------------- METHODS -------------------------

  const isAutofillAnroid =
    uiStore.isFromAutoFill || uiStore.isOnSaveLogin || uiStore.isFromAutoFillItem

  // ---------------------- METHODS -------------------------

  // ---------------------- COMPONENTS -------------------------

  // -------------- EFFECT ------------------

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
            navigation.navigate("login")
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
      }
      route.params.email && user.setOnPremaiseEmail(route.params.email)
      user.setOnPremiseUser(true)
      route.params.data?.base_api && user.setOnPremiseLastBaseUrl(route.params.data.base_api + "/v3")
      route.params.data?.base_api && user.environment.api.apisauce.setBaseURL(route.params.data.base_api + "/v3")
    } 
  }, [])
  // ---------------------- RENDER -------------------------

  if (lockMethod === "masterpass") {
    if (route.params.type === "onPremise") {
      return <OnPremiseLockMasterPassword 
        data={route.params.data}
        email={route.params.email}
      />
    }
    return <LockByMasterPassword />
  }
  return <LockByPasswordless />
})
