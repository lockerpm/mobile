import React, { FC, useEffect, useState } from "react"
import { NativeModules, StyleSheet } from "react-native"
import { IS_IOS, VIN_AUTH_CALLBACK, VIN_AUTH_ENDPOINT } from "app/config/constants"
import { getUrlParameterByName } from "app/utils/utils"
import { Button, Header, Logo, Screen, Text, TextInput } from "app/components/cores"
import { LockType } from "app/static/types"
import { useAppLocale } from "app/services/context"
import { SSOScreenProps } from "app/navigators"
import { useToast } from "app/services/utils"
import { idApi } from "app/services/api"

const { VinCssSsoLoginModule } = NativeModules

export const SSOEmailLoginScreen: FC<SSOScreenProps<"ssoLogin">> = ({ navigation, route }) => {
  const { notify, notifyTx, notifyApiError } = useToast()
  const { translate } = useAppLocale()

  // ------------------PARAMS--------------------
  const [username, setUsername] = useState("")
  const [nfcAuthen, setNfcAuthen] = useState(false)
  const [usbAuthen, setUsbAuthen] = useState(false)

  const [isError, setIsError] = useState(false)
  const [loaddingAuthen, setLoadingAuth] = useState(0) // 0: none, 1: usb, 2: nfc, 3: ios

  // ------------------METHODS--------------------
  const handleLogin = async () => {
    setIsError(false)
    const res = await idApi.onPremisePreLogin({ email: username })
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
        notifyTx("error", "error.onpremise_login_failed")
      }
      if (res.data[0]?.activated) {
        navigation.navigate("lock", {
          type: LockType.OnPremise,
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
    const startWebauth =
      method === "nfc" ? VinCssSsoLoginModule.startNFCAuthen : VinCssSsoLoginModule.startUSBAuthen

    const result = await startWebauth(VIN_AUTH_ENDPOINT, VIN_AUTH_CALLBACK)

    if (result.error_code) {
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

    const result = await VinCssSsoLoginModule.startWebauth(VIN_AUTH_ENDPOINT, VIN_AUTH_CALLBACK)
    if (!result) {
      notify("error", "Unknow error")
      setLoadingAuth(0)
      return
    }
    const code = getUrlParameterByName("code", result)

    await loginWithCode(code)
    setLoadingAuth(0)
  }

  const loginWithCode = async (code: string) => {
    const res = await idApi.onPremisePreLogin({ identifier: route.params.identifier, code })
    if (res.kind !== "ok") {
      notifyApiError(res)
    } else {
      if (res.data.length === 0) {
        notifyTx("error", "error.onpremise_login_failed")
      }
      if (res.data[0]?.activated) {
        setLoadingAuth(0)
        navigation.navigate("lock", {
          type: LockType.OnPremise,
          data: res.data[0],
          email: res.data[0].email,
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
      preset="auto"
      padding
      safeAreaEdges={["bottom"]}
      header={<Header leftIcon="arrow-left" onLeftPress={navigation.goBack} />}
    >
      <Logo preset={"cystack-logo"} style={styles.logo} />

      <Text preset="bold" size="xl" tx={"sso.id.title"} style={styles.title} />

      <TextInput
        animated
        isError={isError}
        labelTx="login.email_or_username"
        onChangeText={setUsername}
        value={username}
        style={styles.input}
      />

      <Button
        disabled={!username}
        tx="common.continue"
        onPress={handleLogin}
        style={styles.continue}
      />

      {IS_IOS && (
        <Button
          loading={loaddingAuthen === 3}
          tx="sso.email.ble"
          onPress={() => {
            handleWebauthLoginIOS()
          }}
          style={styles.button}
        />
      )}

      {usbAuthen && (
        <Button
          loading={loaddingAuthen === 1}
          tx="sso.email.usb"
          onPress={() => {
            handleWebauthLoginAndroid("usb")
          }}
          style={styles.button}
        />
      )}

      {nfcAuthen && (
        <Button
          loading={loaddingAuthen === 2}
          tx="sso.email.nfc"
          onPress={() => {
            handleWebauthLoginAndroid("nfc")
          }}
          style={styles.button}
        />
      )}

      <Text preset="label" tx="sso.id.create_sso" style={styles.mt4} />
      <Text preset="label" style={styles.mt4}>
        {translate("sso.id.contact_at")}
        <Text preset="bold" tx="sso.id.contact" style={{ textDecorationLine: "underline" }} />
      </Text>
    </Screen>
  )
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    marginTop: 12,
  },
  continue: {
    marginBottom: 16,
    marginTop: 24,
  },
  input: {
    marginBottom: 12,
    width: "100%",
  },
  logo: {
    alignSelf: "center",
    height: 70,
    marginBottom: 10,
    width: 70,
  },
  mt4: {
    marginTop: 4,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
})
