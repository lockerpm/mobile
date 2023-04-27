import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Image, NativeModules, View } from "react-native"
import { Button, FloatingInput, Text } from "../../../components"
import { Header, Screen } from "../../../components/cores"
import { useStores } from "../../../models"
import { RootParamList } from "../../../navigators"
import { useMixins } from "../../../services/mixins"
import { getUrlParameterByName } from "../../../utils/helpers"

const APP_ICON_DARK = require("../../../common/images/appIcon/textHorizontal.png")
const APP_ICON_LIGHT = require("../../../common/images/appIcon/textHorizontal-light.png")

const { VinCssSsoLoginModule } = NativeModules

export const SSOEmailLoginScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<RouteProp<RootParamList, "ssoLogin">>()
  const { user, uiStore } = useStores()

  const { translate, notify, notifyApiError, setApiTokens } = useMixins()

  const [username, setUsername] = useState("")
  const [nfcAuthen, setNfcAuthen] = useState(false)
  const [usbAuthen, setUsbAuthen] = useState(false)

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

  console.log(uiStore.cacheCode)

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

  const handleWebauthLogin = async (method: "nfc" | "usb") => {
    const startWebauth =
      method === "nfc" ? VinCssSsoLoginModule.startNFCAuthen : VinCssSsoLoginModule.startUSBAuthen
    const result = await startWebauth(
    
    )
    console.log(result)

    if (!!result.error_code) {
      notify("error", result.error_message)
      return
    }

    notify("error", result.url)

    const code = getUrlParameterByName("code", result.url)
    uiStore.setCacheCode(result.url)

    notify("success", code)

    // const res = await user.onPremisePreLogin({ identifier: route.params.identifier, code })
    // if (res.kind !== "ok") {
    //   notifyApiError(res)
    // } else {
    //   if (res.data.length === 0) {
    //     notify("error", translate("error.onpremise_login_failed"))
    //   }
    //   if (res.data[0]?.activated) {
    //     navigation.navigate("lock", {
    //       type: "onPremise",
    //       data: res.data[0],
    //       email: res.email || "asdasd",
    //     })
    //   }
    // }
  }

  const test = async (code: string) => {
    const res = await user.onPremisePreLogin({ identifier: route.params.identifier, code })
    if (res.kind !== "ok") {
      notifyApiError(res)
    } else {
      if (res.data.length === 0) {
        notify("error", translate("error.onpremise_login_failed"))
      }
      if (res.data[0]?.activated) {
        navigation.navigate("lock", {
          type: "onPremise",
          data: res.data[0],
          email:  "asdasd",
        })
      }
    }
  }

  useEffect(() => {
    if (route.params.use_sso) {
      showWebauthOpeions()
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

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {nfcAuthen && (
          <Button
            text="Nfc Authen"
            onPress={() => {
              handleWebauthLogin("nfc")
            }}
          />
        )}
        {usbAuthen && (
          <Button
            text="Usb Authen"
            onPress={() => {
              handleWebauthLogin("usb")
            }}
          />
        )}
      </View>

      <Button
        text="Usb Authen"
        onPress={() => {
          test(uiStore.cacheCode)
        }}
      />

      <Text text="Looking to create an SSO Identifier instead?" style={{ marginTop: 4 }} />
      <Text preset="black" style={{ marginTop: 4 }}>
        Contact us at{" "}
        <Text preset="bold" style={{ textDecorationLine: "underline" }}>
          contact@locker.io
        </Text>
      </Text>
    </Screen>
  )
})


