import React, { useState, useRef, useEffect } from "react"
import { Platform, View } from "react-native"
import { useStores } from "app/models"
import { Passkey, PasskeyAuthenticationResult } from "react-native-passkey"
import { PasskeyAuthenticationRequest } from "react-native-passkey/lib/typescript/Passkey"
import { credentialAuthOptions, publicKeyCredentialWithAssertion } from "app/utils/passkey"


import { AutoImage as Image, Text, FloatingInput, Button } from "../../../components"
import { spacing } from "../../../theme"
import { APP_ICON } from "../../../common/mappings"

import { IosPasskeyOptions } from "../signup/ios-passkey-options"
import { useHelper } from "app/services/hook"
import { translate } from "app/i18n"
import { SocialLogin } from "app/components-v2/utils"

type Props = {
  nextStep: (username: string, password: string, methods: { type: string; data: any }[]) => void
  onLoggedIn: (newUser: boolean, token: string) => Promise<void>
  handleForgot: () => void
}

enum METHOD {
  PASSKEY = 0,
  PASSWORD = 1,
  NONE = 2,
}

const IS_IOS = Platform.OS === 'ios'

export const LoginForm = ({ nextStep, onLoggedIn, handleForgot }: Props) => {
  const { user } = useStores()
  const { notify, notifyApiError, setApiTokens } = useHelper()

  // ------------------ Params -----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [loginMethod, setLoginMethod] = useState<METHOD>(METHOD.NONE)
  const [passkeySupported, setPasskeySupported] = useState(false)
  const [showExtraPasskeyLogin, setShowExtraPasskeyLogin] = useState(false)
  const passwordRef = useRef(null)

  const [isShowCreatePasskeyOptions, setIsShowCreatePasskeyOptions] = useState(false)
  const [isIcloudSelected, setIsIcloudSelected] = useState(true)
  // ------------------ Methods ----------------------

  const getLoginMethod = async () => {
    const res = await user.loginMethod(username)
    if (res.kind === "ok") {
      if (res.data.webauthn) {
        setLoginMethod(METHOD.PASSKEY)
        if (IS_IOS) {
          setIsShowCreatePasskeyOptions(true)
        } else {
          await handleAuthWebauth()
        }
        setShowExtraPasskeyLogin(true)
        return
      }
      setLoginMethod(METHOD.PASSWORD)
    } else {
      notifyApiError(res)
    }
  }

  const handleLogin = async () => {
    setIsLoading(true)
    setIsError(false)

    const payload = { username, password }
    const res = await user.login(payload)
    setIsLoading(false)
    if (res.kind !== "ok") {
      setIsError(true)
      if (res.kind === "unauthorized" && res.data) {
        const errorData: {
          code: string
          message: string
        } = res.data
        switch (errorData.code) {
          case "1001": {
            notify("error", translate("error.wrong_username_or_password"))
            break
          }
          case "1003": {
            notify("error", translate("error.account_not_activated"))
            break
          }
          default: {
            notify("error", errorData.message)
          }
        }
      } else {
        notifyApiError(res)
      }
    } else {
      setPassword("")
      if (res.data.is_factor2) {
        nextStep(username, password, res.data.methods)
      } else {
        // @ts-ignore
        setApiTokens(res.data?.access_token)
        onLoggedIn(false, "")
      }
    }
  }

  const handleAuthWebauth = async (withSecurityKey?: boolean) => {
    const resAuthPasskeyOptions = await user.authPasskeyOptions(username)
    if (resAuthPasskeyOptions.kind === "ok") {
      try {
        const authRequest: PasskeyAuthenticationRequest = credentialAuthOptions(
          resAuthPasskeyOptions.data,
        )

        // return
        // Call the `authenticate` method with the retrieved request in JSON format
        // A native overlay will be displayed
        const result: PasskeyAuthenticationResult = await Passkey.authenticate(authRequest, { withSecurityKey })

        const res = await user.authPasskey({
          username,
          response: publicKeyCredentialWithAssertion(result),
        })

        if (res.kind === "ok") {
          setPassword("")
          if (res.data.is_factor2) {
            nextStep(username, password, res.data.methods)
          } else {
            // @ts-ignore
            setApiTokens(res.data?.access_token)
            onLoggedIn(false, "")
          }
        } else {
          if (res.kind === "unauthorized") {
            notify("error", translate("passkey.error.login_failed"))
          }
          setLoginMethod(METHOD.PASSWORD)
        }
        // The `authenticate` method returns a FIDO2 assertion result
        // Pass it to your server for verification
      } catch (error) {
        // Handle Error...
        if (error.error === "UserCancelled") {
          notify("error", translate("passkey.error.user_cancel"))
        }
        setLoginMethod(METHOD.PASSWORD)
      }
    } else {
      notifyApiError(resAuthPasskeyOptions)
    }
  }
  // ------------------------------ DATA -------------------------------
  const checkPasskeySupported = async () => {
    const res = await Passkey.isSupported()
    if (res) {
      setLoginMethod(METHOD.NONE)
      setPasskeySupported(true)
      return
    }
    setLoginMethod(METHOD.PASSWORD)
  }

  useEffect(() => {
    checkPasskeySupported()
  }, [])


  // ------------------------------ RENDER -------------------------------
  const AuthWithPasskey = () => {
    if (!showExtraPasskeyLogin) return null
    return (
      <Button
        preset="outline"
        isLoading={isLoading}
        isDisabled={isLoading || !username}
        text={translate("passkey.login_passkey")}
        onPress={() => {
          if (Platform.OS === "ios") {
            setIsShowCreatePasskeyOptions(true)
          } else {
            handleAuthWebauth(false)
          }
        }}
        style={{
          width: "100%",
          height: 50,
          marginBottom: 12
        }}
      />
    )
  }

  // ------------------------------ RENDER -------------------------------

  return (
    <View>
      <View style={{ alignItems: "center" }}>
        {IS_IOS && (
          <IosPasskeyOptions
            isOpen={isShowCreatePasskeyOptions}
            onClose={() => {
              setIsShowCreatePasskeyOptions(false)
            }}
            label={translate('passkey.login_passkey_options')}
            title={translate("common.login")}
            isIcloudSelected={isIcloudSelected}
            setIsIcloudSelected={setIsIcloudSelected}
            action={async () => {
              setIsShowCreatePasskeyOptions(false)
              await handleAuthWebauth(!isIcloudSelected)
            }}
          />
        )}

        <Image
          source={APP_ICON.icon}
          style={{ height: 70, width: 70, marginBottom: spacing.small, marginTop: spacing.huge }}
        />

        <Text
          preset="header"
          text={translate("login.title")}
          style={{ marginBottom: spacing.large }}
        />

        {/* Username input */}
        <FloatingInput
          isInvalid={isError}
          label={translate("login.email_or_username")}
          onChangeText={(val) => {
            if (passkeySupported && loginMethod !== METHOD.NONE) {
              setLoginMethod(METHOD.NONE)
              setShowExtraPasskeyLogin(false)
            }
            setUsername(val)
          }}
          value={username}
          style={{ width: "100%", marginBottom: spacing.small }}
          onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
        />
        {/* Username input end */}

        {/* Password input */}
        {loginMethod === METHOD.PASSWORD && (
          <FloatingInput
            outerRef={passwordRef}
            isPassword
            isInvalid={isError}
            label={translate("common.password")}
            onChangeText={setPassword}
            value={password}
            style={{ width: "100%" }}
            onSubmitEditing={handleLogin}
          />
        )}
        {/* Password input end */}

        {loginMethod === METHOD.PASSWORD && (
          <View
            style={{
              width: "100%",
              alignItems: "flex-start",
              marginTop: spacing.large,
            }}
          >
            <Button
              preset="link"
              text={translate("login.forgot_password")}
              onPress={handleForgot}
            />
          </View>
        )}

        {loginMethod === METHOD.PASSWORD && (
          <Button
            isLoading={isLoading}
            isDisabled={
              isLoading || !(username && password)
            }
            text={translate("common.login")}
            onPress={handleLogin}
            style={{
              width: "100%",
              marginBottom: spacing.medium,
              marginTop: spacing.medium,
            }}
          />
        )}

        {loginMethod !== METHOD.PASSWORD && (
          <Button
            isLoading={isLoading}
            isDisabled={!username}
            text={"Continue"}
            onPress={getLoginMethod}
            style={{
              width: "100%",
              marginBottom: spacing.medium,
              marginTop: spacing.medium,
            }}
          />
        )}


        {AuthWithPasskey()}

        <SocialLogin onLoggedIn={onLoggedIn} />
      </View>
    </View>
  )
}
