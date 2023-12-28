import React, { FC, useEffect, useState } from "react"
import { NativeModules, Platform, View } from "react-native"
import { useTheme } from "app/services/context"
import { Button, Screen, Text, Logo } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { useHelper } from "app/services/hook"
import { RootStackScreenProps } from "app/navigators/navigators.types"
import { useStores } from "app/models"
import { ANDROID_PWL_METHOD, AdnroidPasswordlessOptions } from "./AndroidPasswordLessOptionsModal"
import { getUrlParameterByName } from "app/utils/utils"
import { VIN_AUTH_CALLBACK } from "app/config/constants"

const { VinCssSsoLoginModule } = NativeModules

const IS_ANDROID = Platform.OS === "android"

export const OnboardingScreen: FC<RootStackScreenProps<"onBoarding">> = observer((props) => {
  const { isDark } = useTheme()
  const { user } = useStores()
  const { translate, notifyApiError, notify } = useHelper()

  const [isShowPasswordLessAndroidOptions, setShowPasswordLessAndroidOptions] = useState(false)
  const [ssoConfig, setSssoConfig] = useState<{
    client_id: string
    authority: string
    authorization_endpoint: string
    token_endpoint: string
    redirect_behavior: string
    userinfo_endpoint: string
  }>(null)
  const [isLoading, setIsLoading] = useState(false)

  const navigateLogin = (email?: string) => {
    if (email) {
      props.navigation.navigate("lock", {
        email,
      })
      return
    }
    props.navigation.navigate("login")
  }

  const checkExist = async () => {
    const res = await user.ssoCheckExist()
    if (res.kind === "ok" && res.data.existed) {
      setSssoConfig(res.data.sso_configuration.sso_provider_options)
    }
  }

  const loginWithCode = async (code: string) => {
    const res = await user.onPremisePreLogin(code)
    if (res.kind !== "ok") {
      notifyApiError(res)
    } else {
      navigateLogin(res.data.mail)
    }
  }

  const handleWebauthLoginIOS = async () => {
    setIsLoading(true)

    const authorize = ssoConfig.authorization_endpoint
    const clientId = ssoConfig.client_id
    const VIN_AUTH_ENDPOINT = `${authorize}?response_type=code&client_id=${clientId}&redirect_uri=${VIN_AUTH_CALLBACK}`

    const result = await VinCssSsoLoginModule.startWebauth(VIN_AUTH_ENDPOINT, VIN_AUTH_CALLBACK)
    if (!result) {
      notify("error", "Unknow error")
      setIsLoading(false)
      return
    }
    const code = getUrlParameterByName("code", result)

    await loginWithCode(code)
    setIsLoading(false)
  }

  const handleWebauthLoginAndroid = async (method: ANDROID_PWL_METHOD) => {
    setIsLoading(true)
    const authorize = ssoConfig.authorization_endpoint
    const clientId = ssoConfig.client_id
    const VIN_AUTH_ENDPOINT = `${authorize}?response_type=code&client_id=${clientId}&redirect_uri=${VIN_AUTH_CALLBACK}`

    const startWebauth =
      method === ANDROID_PWL_METHOD.NFC
        ? VinCssSsoLoginModule.startNFCAuthen
        : VinCssSsoLoginModule.startUSBAuthen

    const result = await startWebauth(VIN_AUTH_ENDPOINT, VIN_AUTH_CALLBACK)

    if (result.error_code) {
      notify("error", result.error_message)
      setIsLoading(false)
      return
    }

    const code = getUrlParameterByName("code", result.url)

    await loginWithCode(code)
    setIsLoading(false)
  }

  const loginOnPress = () => {
    if (!ssoConfig) navigateLogin()

    if (IS_ANDROID) {
      setShowPasswordLessAndroidOptions(true)
    } else {
      handleWebauthLoginIOS()
    }
  }

  useEffect(() => {
    checkExist()
  }, [])

  const footer = () => (
    <View
      style={{
        marginHorizontal: 20,
      }}
    >
      <Button
        disabled={isLoading}
        loading={isLoading}
        preset="primary"
        text={translate("common.login")}
        onPress={loginOnPress}
      />
    </View>
  )

  return (
    <Screen
      safeAreaEdges={["bottom", "top"]}
      footer={footer()}
      KeyboardAvoidingViewProps={{
        behavior: undefined,
      }}
      contentContainerStyle={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Logo
        preset={isDark ? "vertical-light" : "vertical-dark"}
        style={{
          width: 173,
          height: 158,
          marginBottom: 16,
        }}
      />
      <Text text={translate("onBoarding.title")} preset="bold" />

      <AdnroidPasswordlessOptions
        isOpen={isShowPasswordLessAndroidOptions}
        onClose={() => {
          setShowPasswordLessAndroidOptions(false)
        }}
        login={handleWebauthLoginAndroid}
      />
    </Screen>
  )
})
