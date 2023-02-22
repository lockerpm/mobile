import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { View, Image, TouchableOpacity } from "react-native"
import { APP_ICON, SOCIAL_LOGIN_ICON } from "../../../common/mappings"
import { Button, Screen, Text } from "../../../components/cores"
import { LanguagePicker } from "../../../components/utils"
import { IS_IOS, IS_PROD } from "../../../config/constants"
import { useStores } from "../../../models"
import { useMixins } from "../../../services/mixins"
import { verticalScale } from "../../../services/mixins/adaptive-layout"
import { useSocialLoginMixins } from "../../../services/mixins/social-login"
import { GitHubLoginModal } from "../login/github-login-modal"

export const LoginSelectScreen = observer(() => {
  const navigation = useNavigation()
  const { uiStore, user } = useStores()
  const { translate } = useMixins()
  const { googleLogin, facebookLogin, githubLogin, appleLogin } = useSocialLoginMixins()

  const [showGitHubLogin, setShowGitHubLogin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const onLoggedIn = async (newUser?: boolean, token?: string) => {
    const [userRes, userPwRes] = await Promise.all([user.getUser(), user.getUserPw()])
    if (userRes.kind === "ok" && userPwRes.kind === "ok") {
      if (user.is_pwd_manager) {
        navigation.navigate("lock")
      } else {
        navigation.navigate("createMasterPassword")
      }
    }
  }

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

  return (
    <Screen
      safeAreaEdges={["top"]}
      contentContainerStyle={{
        flex: 1,
        padding: 20,
        paddingTop: 70,
      }}
    >
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
      <LanguagePicker />
      <View
        style={{
          alignItems: "center",
          marginBottom: 24
        }}
      >
        <Image
          source={uiStore.isDark ? APP_ICON.textVerticalLight : APP_ICON.textVertical}
          style={{ height: verticalScale(80), width: verticalScale(90) }}
        />
      </View>
      <Text preset="bold" text={"Sign in to your account"} size="large" style={{ marginBottom: 16 }} />
      <Button
        onPress={() => {
          navigation.navigate("login", { type: "individual" })
        }}
        size="large"
        text="individual"
        style={{ marginBottom: 16 }}
      />
      {/* <Button onPress={() => {}} size="large" text="Business" style={{ marginBottom: 16 }} /> */}
      <Button
        onPress={() => {
          navigation.navigate("login", { type: "onPremise" })
        }}
        size="large"
        text="Enterprise"
        style={{ marginBottom: 16 }}
      />

      <Text
        preset="label"
        text={IS_PROD ? translate("common.or_login_with") : ""}
        style={{ marginBottom: 12, textAlign: "center" }}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {Object.values(SOCIAL_LOGIN)
          .filter((item) => !item.hide)
          .map((item, index) => (
            <TouchableOpacity key={index} onPress={item.handler} style={{ marginHorizontal: 12 }}>
              <item.icon height={40} width={40} />
            </TouchableOpacity>
          ))}
      </View>
    </Screen>
  )
})
