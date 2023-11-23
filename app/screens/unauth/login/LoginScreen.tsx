import React, { FC, useState } from "react"
import { View } from "react-native"
import { RootStackScreenProps } from "app/navigators/navigators.types"
import { Screen, Text, TextInput, Button, Logo } from "app/components/cores"
import { useTheme } from "app/services/context"
import { observer } from "mobx-react-lite"
import { useAuthentication, useHelper } from "app/services/hook"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { LoginMethod } from "app/static/types"
import Animated, { FadeInUp } from "react-native-reanimated"

export const LoginScreen: FC<RootStackScreenProps<"login">> = observer(() => {
  const navigation = useNavigation() as any
  const { colors } = useTheme()
  const { user } = useStores()
  const { translate } = useHelper()
  const { sessionLogin } = useAuthentication()

  // ------------------------------ PARAMS -------------------------------

  const [lockMethod, setLogMethod] = useState<LoginMethod | null>(null)

  const [isError, setIsError] = useState(false)

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  // ------------------------------ METHODS -------------------------------

  const fetchPreloginMethod = async () => {
    const res = await user.preloginMethod(username)
    if (res.kind === "ok") {
      if (res.data.login_method === LoginMethod.PASSWORD) {
        setLogMethod(LoginMethod.PASSWORD)
      } else {
        navigation.navigate("lock", {
          type: LoginMethod.PASSWORDLESS,
          email: res.data.email,
        })
      }
    }
  }

  const handleLogin = async () => {
    if (password) {
      setIsError(false)
      setLoginLoading(true)
      const res = await sessionLogin(password, username)
      setLoginLoading(false)

      if (res.kind === "ok") {
        setPassword("")
        navigation.navigate("mainStack", { screen: "start" })
      } else {
        setIsError(true)
      }
    } else {
      setIsError(true)
    }
  }

  // ------------------------------ EFFECT -------------------------------

  // ------------------------------ RENDER -------------------------------

  return (
    <Screen
      preset="auto"
      padding
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        {/* <LoginForm  /> */}
        <View style={{ marginTop: 56 }}>
          <Logo
            preset={"default"}
            style={{ height: 80, width: 70, marginBottom: 10, alignSelf: "center" }}
          />

          <Text
            preset="bold"
            size="xl"
            text={translate("login.title")}
            style={{ marginBottom: 20, textAlign: "center" }}
          />

          <TextInput
            animated
            isError={isError}
            label={translate("login.email_or_username")}
            value={username}
            onChangeText={setUsername}
          />

          {lockMethod === LoginMethod.PASSWORD && (
            <Animated.View entering={FadeInUp}>
              <TextInput
                animated
                isRequired
                isPassword
                isError={isError}
                label={translate("common.password")}
                onChangeText={setPassword}
                value={password}
                onSubmitEditing={handleLogin}
              />

              <Button
                loading={loginLoading}
                disabled={loginLoading || !(username && password)}
                text={translate("common.login")}
                onPress={handleLogin}
                style={{
                  marginVertical: 16,
                }}
              />
            </Animated.View>
          )}

          {!lockMethod && (
            <Button
              disabled={!username}
              text={translate("common.continue")}
              onPress={fetchPreloginMethod}
              style={{
                marginVertical: 16,
              }}
            />
          )}
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 12,
          }}
        >
          <Text
            text={translate("login.no_account")}
            style={{
              marginRight: 12,
            }}
          />
          <Text
            color={colors.primary}
            text={translate("common.sign_up")}
            onPress={() => navigation.navigate("signup")}
          />
        </View>
      </View>
    </Screen>
  )
})
