import React, { FC, useState } from "react"
import { View } from "react-native"
import { RootStackScreenProps } from "app/navigators/navigators.types"
import { Screen, Text, TextInput, Button, Logo, Icon, Header } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { useAuthentication, useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { LoginMethod } from "app/static/types"
import Animated, { FadeInUp } from "react-native-reanimated"
import { useTheme } from "app/services/context"

export const LoginScreen: FC<RootStackScreenProps<"login">> = observer((props) => {
  const navigation = props.navigation
  const { isGuestMode = false } = props.route.params || {}
  const { user, uiStore } = useStores()
  const { translate } = useHelper()
  const { sessionLogin } = useAuthentication()
  const { colors } = useTheme()

  // ------------------------------ PARAMS -------------------------------

  const [lockMethod, setLogMethod] = useState<LoginMethod | null>(
    isGuestMode ? LoginMethod.PASSWORD : null,
  )

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
      safeAreaEdges={["bottom"]}
      contentContainerStyle={{ flex: 1 }}
      header={<Header leftIcon="arrow-left" onLeftPress={() => navigation.navigate('onBoarding')} />}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        {/* <LoginForm  /> */}
        <View style={{ marginTop: 26 }}>
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

              {!isGuestMode && (
                <Button
                  preset="secondary"
                  disabled={loginLoading}
                  onPress={() => {
                    uiStore.setIsFromPassword(true)
                    navigation.navigate("lock", {
                      email: username,
                      type: LoginMethod.PASSWORDLESS,
                    })
                  }}
                >
                  <>
                    <Icon icon="qr-code" color={colors.primary} />
                    <Text
                      color={colors.primary}
                      preset="bold"
                      text={translate("lock.qr_lock")}
                      style={{
                        padding: 4,
                        marginLeft: 4,
                      }}
                    />
                  </>
                </Button>
              )}
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
        {/* <View
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
        </View> */}
      </View>
    </Screen>
  )
})
