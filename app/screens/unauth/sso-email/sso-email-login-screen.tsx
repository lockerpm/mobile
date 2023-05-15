import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Image, NativeModules } from "react-native"
import { Button, FloatingInput, Text } from "../../../components"
import { Header, Screen } from "../../../components/cores"
import { useStores } from "../../../models"
import { RootParamList } from "../../../navigators"
import { useMixins } from "../../../services/mixins"
import { getUrlParameterByName } from "../../../utils/helpers"
import { IS_IOS, VIN_AUTH_CALLBACK, VIN_AUTH_ENDPOINT } from "../../../config/constants"

const APP_ICON_DARK = require("../../../common/images/appIcon/textHorizontal.png")
const APP_ICON_LIGHT = require("../../../common/images/appIcon/textHorizontal-light.png")

const { VinCssSsoLoginModule } = NativeModules

export const SSOEmailLoginScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<RouteProp<RootParamList, "ssoLogin">>()
  const { user, uiStore } = useStores()

  const { translate, notify, notifyApiError } = useMixins()

  const [username, setUsername] = useState("")
  const [nfcAuthen, setNfcAuthen] = useState(false)
  const [usbAuthen, setUsbAuthen] = useState(false)
  const [loaddingAuthen, setLoadingAuth] = useState<0 | 1 | 2 |3>(0)

  const [isError, setIsError] = useState(false)

  const handleLogin = async () => {
    setIsError(false)
    const res = await user.onPremisePreLogin({ email: username })
    if (res.kind !== "ok") {
      setIsError(true)
      if (res.kind === "unauthorized" && res.data) {
        const errorData: {
          code: string
          message: string
        } = res.data
        notify("error", errorData.message)
      } else {
        notifyApiError(res)
      }
    } else {
      if (res.data.length === 0) {
        notify("error", translate("error.onpremise_login_failed"))
      }
      if (res.data[0]?.activated) {
        navigation.navigate("lock", {
          type: "onPremise",
          data: res.data[0],
          email: username,
        })
      }
    }
  }

  const showWebauthOpeions = async () => {
    const { FEATURE_USB_HOST, FEATURE_NFC } = VinCssSsoLoginModule.getConstants()

    const nfcUsable = await VinCssSsoLoginModule.hasSystemFeature(FEATURE_NFC)
    if (nfcUsable) {
      setNfcAuthen(true)
    }
    const usbUsable = await VinCssSsoLoginModule.hasSystemFeature(FEATURE_USB_HOST)
    if (usbUsable) {
      setUsbAuthen(true)
    }
  }

  const handleWebauthLoginAndroid = async (method: "nfc" | "usb") => {
    setLoadingAuth(method === "usb" ? 1 : 2)
    const startWebauth =  method === "nfc"
      ? VinCssSsoLoginModule.startNFCAuthen
      : VinCssSsoLoginModule.startUSBAuthen

    const result = await startWebauth(VIN_AUTH_ENDPOINT, VIN_AUTH_CALLBACK)

 
    if (!!result.error_code) {
      notify("error", result.error_message)
      setLoadingAuth(0)
      return
    }

    const code = getUrlParameterByName("code", result.url)

    await loginWithCode(code)
    setLoadingAuth(0)
  }

  const handleWebauthLoginIOS = async () => {
    setLoadingAuth(3)

    const result = await  VinCssSsoLoginModule.startWebauth(VIN_AUTH_ENDPOINT, VIN_AUTH_CALLBACK)
    if (!result) {
      notify("error", "Unknow error")
      setLoadingAuth(0)
      return
    }
    const code = getUrlParameterByName("code", result)

    await loginWithCode(code)
    setLoadingAuth(0)
  }


  const loginWithCode = async (code:string) => {
    const res = await user.onPremisePreLogin({ identifier: route.params.identifier, code })
    if (res.kind !== "ok") {
      notifyApiError(res)
    } else {
      if (res.data.length === 0) {
        notify("error", translate("error.onpremise_login_failed"))
      }
      if (res.data[0]?.activated) {
        setLoadingAuth(0)
        navigation.navigate("lock", {
          type: "onPremise",
          data: res.data[0],
          email: res.data[0].email || "asdasd",
        })
      }
    }
  }

  useEffect(() => {
    if (route.params.use_sso) {
      !IS_IOS && showWebauthOpeions()
    }
  }, [])

  return (
    <Screen
      safeAreaEdges={["top"]}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
        />
      }
      contentContainerStyle={{
        padding: 20,
        paddingTop: 0,
      }}
    >
      <Image
        source={uiStore.isDark ? APP_ICON_LIGHT : APP_ICON_DARK}
        style={{
          height: 50,
          width: 180,
          alignSelf: "center",
        }}
        resizeMode="contain"
      />
      <Text
        preset="semibold"
        text="Sign in to your company"
        style={{
          fontSize: 20,
          marginBottom: 16,
          marginTop: 32,
          textAlign: "center",
        }}
      />

      <FloatingInput
        isInvalid={isError}
        label={translate("login.email_or_username")}
        onChangeText={setUsername}
        value={username}
        style={{ width: "100%", marginBottom: 12 }}
        // onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
      />

      <Button
        isDisabled={!username}
        text="Continue"
        onPress={handleLogin}
        style={{ marginTop: 24, marginBottom: 16 }}
      />

      {IS_IOS && (
        <Button
          isLoading={loaddingAuthen === 3}
          text="Ble Authen"
          onPress={() => {
            handleWebauthLoginIOS()
          }}
          style={{
            flex: 1,
            marginTop: 12,
          }}
        />
      )}

      {usbAuthen && (
        <Button
          isLoading={loaddingAuthen === 1}
          text="Usb Authen"
          onPress={() => {
            handleWebauthLoginAndroid("usb")
          }}
          style={{
            flex: 1,
            marginTop: 12,
          }}
        />
      )}

      {nfcAuthen && (
        <Button
          isLoading={loaddingAuthen === 2}
          text="Nfc Authen"
          onPress={() => {
            handleWebauthLoginAndroid("nfc")
          }}
          style={{
            flex: 1,
            marginTop: 12,
          }}
        />
      )}

      <Text text="Looking to create an SSO Identifier instead?" style={{ marginTop: 12 }} />
      <Text preset="black" style={{ marginTop: 4 }}>
        Contact us at{" "}
        <Text preset="bold" style={{ textDecorationLine: "underline" }}>
          contact@locker.io
        </Text>
      </Text>
    </Screen>
  )
})
