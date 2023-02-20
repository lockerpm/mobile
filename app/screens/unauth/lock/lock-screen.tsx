import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Alert, BackHandler } from "react-native"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { useStores } from "../../../models"
import { useMixins } from "../../../services/mixins"
import { useCipherAuthenticationMixins } from "../../../services/mixins/cipher/authentication"
import { IS_IOS } from "../../../config/constants"
import { useCipherDataMixins } from "../../../services/mixins/cipher/data"
import { LockByMasterPassword } from "./master-password"
import { RootParamList } from "../../../navigators"
import { LockByPasswordless } from "./passwordless"

export const LockScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<RouteProp<RootParamList, "lock">>()
  const { user, uiStore, enterpriseStore } = useStores()
  const { notify, translate, notifyApiError, color } = useMixins()
  const { logout, sessionLogin, biometricLogin } = useCipherAuthenticationMixins()
  const { createCipher } = useCipherDataMixins()

  // ---------------------- PARAMS -------------------------
  const [lockMethod, setLogMethod] = useState<"masterpass" | "passwordless">("masterpass")

  // ---------------------- METHODS -------------------------

  const isAutofillAnroid =
    uiStore.isFromAutoFill || uiStore.isOnSaveLogin || uiStore.isFromAutoFillItem

  // ---------------------- METHODS -------------------------

  // ---------------------- COMPONENTS -------------------------
  const isEnterpriseLogin = route.params.type === "enterprise"

  // -------------- EFFECT ------------------

  useEffect(()=> {
    if (isEnterpriseLogin) {
      // TODO
    }
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

  // ---------------------- RENDER -------------------------

  // if (lockMethod === "masterpass") {
  //   return <LockByMasterPassword />
  // } 
  return <LockByPasswordless />

})
