/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, useRef, useState } from "react"
import { View } from "react-native"
import { RootStackScreenProps } from "app/navigators"
import { Screen, Text, TextInput, Button, Logo } from "app/components/cores"
import { useTheme } from "app/services/context"
import { observer } from "mobx-react-lite"
import { useAuthentication, useHelper } from "app/services/hook"
import { LoginMethod } from "app/static/types"
import { BiometricsType } from "../lock/lock.types"
import { useStores } from "app/models"
import ReactNativeBiometrics from "react-native-biometrics"
import { useNavigation } from "@react-navigation/native"

export const LoginScreen: FC<RootStackScreenProps<"login">> = observer((props) => {
  const navigation = useNavigation() as any
  const { colors } = useTheme()
  const { translate } = useHelper()
  const { user, uiStore } = useStores()
  const { sessionLogin, biometricLogin, logout } = useAuthentication()

  // ------------------------------ PARAMS -------------------------------

  const passwordRef = useRef(null)

  const [isError, setIsError] = useState(false)

  const [username, setUsername] = useState("selfhost@gmail.com")
  const [password, setPassword] = useState("Rongden1211")
  const [loginLoading, setLoginLoading] = useState(false)

  // ------------------------------ METHODS -------------------------------

  const handleLogin = async () => {
    if (password) {
      setIsError(false)
      setLoginLoading(true)
      const res = await sessionLogin(password, username, () => null)
      setLoginLoading(false)

      if (res.kind === "ok") {
        setPassword("")
        navigation.navigate("mainStack", { screen: "start" })
      }  else {
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
      KeyboardAvoidingViewProps={{
        enabled: false,
      }}
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
            onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
          />

          <TextInput
            ref={passwordRef}
            animated
            isRequired
            isPassword
            isError={isError}
            label={translate("common.password")}
            onChangeText={setPassword}
            value={password}
            onSubmitEditing={handleLogin}
          />
          <View
            style={{
              width: "100%",
              alignItems: "flex-start",
              marginTop: 12,
            }}
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
