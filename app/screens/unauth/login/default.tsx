import { useWindowDimensions, View } from "react-native"
import React, { useState, useRef, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../models"
import { AutoImage as Image, Text, FloatingInput, Button } from "../../../components"
import { useMixins } from "../../../services/mixins"
import { commonStyles, spacing } from "../../../theme"
import { APP_ICON, SOCIAL_LOGIN_ICON } from "../../../common/mappings"
import { useSocialLoginMixins } from "../../../services/mixins/social-login"
import { IS_IOS, IS_PROD } from "../../../config/constants"
import { GitHubLoginModal } from "./github-login-modal"
import { useNavigation } from "@react-navigation/native"
import { Passkey, PasskeyAuthenticationResult } from "react-native-passkey"
import { PasskeyAuthenticationRequest } from "react-native-passkey/lib/typescript/Passkey"
import { credentialAuthOptions, publicKeyCredentialWithAssertion } from "../../../utils/passkey"

type Props = {
  nextStep: (username: string, password: string, methods: { type: string; data: any }[]) => void
  onLoggedIn: (newUser: boolean, token: string) => void
  handleForgot: () => void
}

enum METHOD {
  PASSKEY = 0,
  PASSWORD = 1,
  NONE = 2,
}

export const DefaultLogin = observer((props: Props) => {
  const navigation = useNavigation()
  const width = useWindowDimensions().width
  const { user, uiStore } = useStores()
  const { translate, notify, notifyApiError, setApiTokens } = useMixins()
  const { googleLogin, facebookLogin, githubLogin, appleLogin } = useSocialLoginMixins()
  const { nextStep, onLoggedIn, handleForgot } = props
  // ------------------ Params -----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [loginMethod, setLoginMethod] = useState<METHOD>(METHOD.NONE)
  const [passkeySupported, setPasskeySupported] = useState(false)
  const [showExtraPasskeyLogin, setShowExtraPasskeyLogin] = useState(false)
  const passwordRef = useRef(null)

  const [showGitHubLogin, setShowGitHubLogin] = useState(false)

  // ------------------ Methods ----------------------

  const getLoginMethod = async () => {
    const res = await user.loginMethod(username)
    if (res.kind === "ok") {
      if (res.data.webauthn) {
        setLoginMethod(METHOD.PASSKEY)
        await handleAuthWebauth()
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

  const handleAuthWebauth = async () => {
    const resAuthPasskeyOptions = await user.authPasskeyOptions(username)
    if (resAuthPasskeyOptions.kind === "ok") {
      try {
        const authRequest: PasskeyAuthenticationRequest = credentialAuthOptions(
          resAuthPasskeyOptions.data,
        )
        // Call the `authenticate` method with the retrieved request in JSON format
        // A native overlay will be displayed
        const result: PasskeyAuthenticationResult = await Passkey.authenticate(authRequest)

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

  const SOCIAL_LOGIN: {
    [service: string]: {
      hide?: boolean
      icon: any
      handler: () => void
    }
  } = {
    apple: {
      hide: !IS_IOS,
      icon: uiStore.isDark ? SOCIAL_LOGIN_ICON.appleLight : SOCIAL_LOGIN_ICON.apple,
      handler: () => {
        return appleLogin({
          setIsLoading,
          onLoggedIn,
        })
      },
    },

    google: {
      hide: !IS_PROD,
      icon: SOCIAL_LOGIN_ICON.google,
      handler: () => {
        return googleLogin({
          setIsLoading,
          onLoggedIn,
        })
      },
    },

    facebook: {
      hide: !IS_PROD,
      icon: SOCIAL_LOGIN_ICON.facebook,
      handler: () => {
        return facebookLogin({
          setIsLoading,
          onLoggedIn,
        })
      },
    },

    github: {
      hide: !IS_PROD,
      icon: uiStore.isDark ? SOCIAL_LOGIN_ICON.githubLight : SOCIAL_LOGIN_ICON.github,
      handler: () => {
        setShowGitHubLogin(true)
      },
    },
    sso: {
      icon: SOCIAL_LOGIN_ICON.sso,
      handler: () => {
        navigation.setParams({
          host: "",
          use_sso: false,
          identifier: "",
        })
        navigation.navigate("ssoIdentifier")
      },
    },
  }

  // ------------------------------ RENDER -------------------------------

  // ------------------------------ RENDER -------------------------------

  return (
    <View>
      <View style={{ alignItems: "center" }}>
        <GitHubLoginModal
          isOpen={showGitHubLogin}
          onClose={() => setShowGitHubLogin(false)}
          onDone={(code) => {
            githubLogin({
              setIsLoading,
              onLoggedIn,
              code,
            })
          }}
        />

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
        {/* Password input end */}

        <View
          style={{
            width: "100%",
            alignItems: "flex-start",
            marginTop: spacing.large,
          }}
        >
          <Button preset="link" text={translate("login.forgot_password")} onPress={handleForgot} />
        </View>

        <Button
          isLoading={isLoading}
          isDisabled={isLoading || !(username && password)}
          text={translate("common.login")}
          onPress={handleLogin}
          style={{
            width: "100%",
            marginBottom: spacing.medium,
            marginTop: spacing.medium,
          }}
        />
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

        { loginMethod === METHOD.PASSWORD && (
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
            isDisabled={isLoading || !(username && password)}
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

        { showExtraPasskeyLogin && (
          <Button
            preset="outline"
            isLoading={isLoading}
            isDisabled={isLoading || !username }
            text={translate("passkey.login_passkey")}
            onPress={handleAuthWebauth}
            style={{
              width: "100%",
              marginBottom: 12,
            }}
          />
        )}

        <View style={commonStyles.CENTER_VIEW}>
          <Text
            text={IS_PROD ? translate("common.or_login_with") : ""}
            style={{ marginBottom: spacing.tiny }}
          />

          <View
            style={[
              commonStyles.CENTER_HORIZONTAL_VIEW,
              { maxWidth: width - 32, justifyContent: "center" },
            ]}
          >
            {Object.values(SOCIAL_LOGIN)
              .filter((item) => !item.hide)
              .map((item, index) => (
                <Button
                  key={index}
                  preset="ghost"
                  onPress={item.handler}
                  style={{ marginHorizontal: spacing.smaller }}
                >
                  <item.icon height={40} width={40} />
                </Button>
              ))}
          </View>
        </View>

      </View>
    </View>
  )
})
