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
import { VIN_AUTH_CALLBACK, VIN_AUTH_ENDPOINT } from "app/config/constants"

const { VinCssSsoLoginModule } = NativeModules

const IS_ANDROID = Platform.OS === "android"

export const OnboardingScreen: FC<RootStackScreenProps<"onBoarding">> = observer((props) => {
  const { isDark } = useTheme()
  const { user } = useStores()
  const { translate, notifyApiError, notify } = useHelper()

  const [isShowPasswordLessAndroidOptions, setShowPasswordLessAndroidOptions] = useState(false)
  const [ssoEndpoint, setSsoEndpoint] = useState('')
  const [isLoading, setIsLoading] = useState(false)




  const checkExist = async () => {
    const res = await user.ssoCheckExist()
    if (res.kind === 'ok' && res.data.existed) {
      console.log(JSON.stringify(res))
      setSsoEndpoint(res.data.sso_configuration.sso_provider_options.authorization_endpoint)
    }
  }

  const loginWithCode = async (code: string) => {
    const res = await user.onPremisePreLogin( code )
    if (res.kind !== "ok") {
      notifyApiError(res)
    } else {
      console.log(res)
      if (res.data.length === 0) {
        notify("error", "TEST")
      }
      notify('success', res.data[0].email,)
      // if (res.data[0]?.activated) {
      //   navigation.navigate("lock", {
      //     type: LockType.OnPremise,
      //     data: res.data[0],
      //     email: res.data[0].email,
      //   })
      // }
    }
  }


  const handleWebauthLoginAndroid = async (method: ANDROID_PWL_METHOD) => {
    setIsLoading(true)

    console.log(JSON.stringify(ssoEndpoint))


    const startWebauth =
      method === ANDROID_PWL_METHOD.NFC
        ? VinCssSsoLoginModule.startNFCAuthen
        : VinCssSsoLoginModule.startUSBAuthen

    const result = await startWebauth(VIN_AUTH_ENDPOINT, VIN_AUTH_CALLBACK)

    console.log(JSON.stringify(result))

    if (result.error_code) {
      notify("error", result.error_message)
      setIsLoading(false)
      return
    }


    const code = getUrlParameterByName("code", result.url)
    notify('success', code)


    await loginWithCode(code)
    setIsLoading(false)
  }

  const navigateLogin = () => {
    props.navigation.navigate("login")
  }

  const loginOnPress = () => {
    if (!ssoEndpoint) navigateLogin()


    if (IS_ANDROID) {
      setShowPasswordLessAndroidOptions(true)
    } else {
      navigateLogin()
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
        onClose={ () => {
          setShowPasswordLessAndroidOptions(false)
        }}
        login={handleWebauthLoginAndroid}
      />
    </Screen>
  )
})
