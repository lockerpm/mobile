import React, { useState, useRef } from "react"
import { View } from "react-native"
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

type Props = {
  onPremise: boolean
  nextStep: (username: string, password: string, methods: { type: string; data: any }[]) => void
  onLoggedIn: (newUser: boolean, token: string) => void
  handleForgot: () => void
}

export const DefaultLogin = observer((props: Props) => {
  const navigation = useNavigation()
  const { user, uiStore } = useStores()
  const { translate, notify, notifyApiError, setApiTokens } = useMixins()
  const { googleLogin, facebookLogin, githubLogin, appleLogin } = useSocialLoginMixins()
  const { nextStep, onLoggedIn, handleForgot, onPremise } = props

  // ------------------ Params -----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const passwordRef = useRef(null)

  const [showGitHubLogin, setShowGitHubLogin] = useState(false)

  // ------------------ Methods ----------------------

  const handleLogin = async () => {
    setIsLoading(true)
    setIsError(false)

    if (!onPremise) {
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
    } else {
      const res = await user.onPremisePreLogin(username)
      setIsLoading(false)
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
        setPassword("")
        if (res?.data[0]?.activated) {
          navigation.navigate("lock", {
            type: "onPremise",
            data: res.data[0],
            email: username,
          })
        }
      }
    }
  }

  // ------------------------------ DATA -------------------------------

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
  }

  // ------------------------------ RENDER -------------------------------

  return (
    <View style={{ alignItems: "center", paddingTop: "10%" }}>
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
        onChangeText={setUsername}
        value={username}
        style={{ width: "100%", marginBottom: spacing.small }}
        onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
      />
      {/* Username input end */}

      {/* Password input */}
      {!onPremise && (
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

      {!onPremise && (
        <View
          style={{
            width: "100%",
            alignItems: "flex-start",
            marginTop: spacing.large,
          }}
        >
          <Button preset="link" text={translate("login.forgot_password")} onPress={handleForgot} />
        </View>
      )}

      <Button
        isLoading={isLoading}
        isDisabled={
          isLoading || (!onPremise && !(username && password)) || (onPremise && !username)
        }
        text={translate("common.login")}
        onPress={handleLogin}
        style={{
          width: "100%",
          marginBottom: spacing.medium,
          marginTop: spacing.medium,
        }}
      />

      {!onPremise && (
        <View style={commonStyles.CENTER_VIEW}>
          <Text
            text={IS_PROD ? translate("common.or_login_with") : ""}
            style={{ marginBottom: spacing.tiny }}
          />

          <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
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
      )}
    </View>
  )
})
