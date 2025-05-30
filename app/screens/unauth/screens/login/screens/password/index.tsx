import React, { FC, useEffect, useRef, useState } from "react"
import { BASE_URL, IS_IOS } from "app/config/constants"
import { useStores } from "app/models"
import { api } from "app/services/api"
import { Passkey } from "react-native-passkey"
import { Button, Header, Logo, Screen, Text, TextInput } from "app/components/cores"
import { useHelper } from "app/services/hook"
import { observer } from "mobx-react-lite"
import { DividerText, IosPasswordlessOptions, SetLanguage, SocialLogin } from "app/components/utils"
import { useAppLocale, useTheme } from "app/services/context"
import { TwoFAAuthenSheet } from "./2faBottomSheet/BottomSheetModal"
import { LoginScreenProps } from "app/navigators"
import { LockType, LOGIN_METHOD } from "app/static/types"
import { useWebAuth } from "./useWebAuth"
import { useLoginPassword } from "./useLoginPassword"
import { TouchableOpacity, View } from "react-native"
import Animated, { FadeInUp } from "react-native-reanimated"
import { useToast } from "app/services/utils"

export const LoginScreen: FC<LoginScreenProps<"login">> = observer(
  ({ navigation, route: { params } }) => {
    const { user } = useStores()
    const { colors } = useTheme()
    const { setApiTokens } = useHelper()
    const { notifyTx, notifyApiError } = useToast()
    const { translate } = useAppLocale()

    const initMethod = params?.initMethod
    const initEmail = params?.email || ""
    // ------------------------------ PARAMS -------------------------------

    const [credential, setCredential] = useState({
      username: "",
      password: "",
      methods: [],
    })
    const [isShow2FASheet, setIsShow2FASheet] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const passwordRef = useRef<any>(null)
    const enableLoginByPassword = useRef(true)

    const [isError, setIsError] = useState(false)
    const [username, setUsername] = useState(initEmail)
    const [password, setPassword] = useState("")
    const [loginMethodLoading, setLoginMethodLoading] = useState<LOGIN_METHOD>(LOGIN_METHOD.NONE)

    const [loginMethod, setLoginMethod] = useState<LOGIN_METHOD>(initMethod || LOGIN_METHOD.NONE)

    const [isShowCreatePasskeyOptions, setIsShowCreatePasskeyOptions] = useState(false)
    const [isIcloudSelected, setIsIcloudSelected] = useState(true)

    // ------------------------------ METHODS -------------------------------

    const onLoggedIn = async (_newUser?: boolean, _token?: string) => {
      const [userRes, userPwRes] = await Promise.all([user.getUser(), user.getUserPw()])
      if (userRes.kind === "ok" && userPwRes.kind === "ok") {
        if (user.is_pwd_manager) {
          navigation.navigate("lock", {
            type: LockType.Individual,
          })
        } else {
          navigation.navigate("createMasterPassword")
        }
      } else {
        notifyTx("error", "passkey.error.login_failed")
      }
      setIsLoading(false)
    }

    const nextStep = (
      username: string,
      password: string,
      methods: { type: string; data: any }[],
    ) => {
      setCredential({ username, password, methods })
      setIsShow2FASheet(true)
    }

    const handleForgot = () =>
      navigation.navigate("forgotPassword", {
        email: "",
      })

    const onGoToPinCode = () => {
      navigation.replace("loginByPincode", {
        email: username,
        havePassword: enableLoginByPassword.current,
      })
    }

    const getLoginMethod = async () => {
      const res = await user.loginMethod(username)
      if (res.kind === "ok") {
        if (res.data.webauthn && Passkey.isSupported()) {
          setLoginMethod(LOGIN_METHOD.PASSKEY)
          if (IS_IOS) {
            setIsShowCreatePasskeyOptions(true)
          } else {
            await handleWebAuthLogin(username)
          }
          return
        }
        if (res.data.is_random_password) {
          enableLoginByPassword.current = false
        }
        onGoToPinCode()
      } else {
        notifyApiError(res)
      }
    }

    const handleLogiSuccess = (data: {
      is_factor2: boolean
      methods: {
        type: string
        data: any
      }[]
      access_token: string
    }) => {
      setPassword("")
      if (data.is_factor2) {
        nextStep(username, password, data.methods)
      } else {
        setApiTokens(data.access_token)
        onLoggedIn(false, "")
      }
    }

    const { handleWebAuthLogin } = useWebAuth({
      setLoginMethodLoading,
      onGoToPinCode,
      handleLogiSuccess,
    })

    const { handlePasswordLogin } = useLoginPassword({
      setLoginMethodLoading,
      setIsError,
      handleLogiSuccess,
    })

    // -------------- EFFECT ------------------

    useEffect(() => {
      user.setOnPremiseUser(false)
      api.apisauce.setBaseURL(BASE_URL)
    }, [])

    // ------------------------------ RENDER -------------------------------

    return (
      <Screen
        preset="auto"
        padding
        safeAreaEdges={["bottom"]}
        header={<Header RightActionComponent={<SetLanguage />} />}
        contentContainerStyle={{ flex: 1, justifyContent: "space-between" }}
      >
        <TwoFAAuthenSheet
          credential={credential}
          isOpen={isShow2FASheet}
          onClose={() => {
            setIsShow2FASheet(false)
          }}
          onLoggedIn={onLoggedIn}
        />
        {/* 
      <LoginForm
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        handleForgot={handleForgot}
        onLoggedIn={onLoggedIn}
        nextStep={nextStep}
      /> */}
        <View>
          <View>
            {IS_IOS && (
              <IosPasswordlessOptions
                isOpen={isShowCreatePasskeyOptions}
                onClose={() => {
                  setIsShowCreatePasskeyOptions(false)
                  onGoToPinCode()
                }}
                label={translate("passkey.login_passkey_options")}
                title={translate("common.signin")}
                isIcloudSelected={isIcloudSelected}
                setIsIcloudSelected={setIsIcloudSelected}
                action={async () => {
                  setIsShowCreatePasskeyOptions(false)
                  await handleWebAuthLogin(username, !isIcloudSelected)
                }}
              />
            )}

            <Logo
              preset={"cystack-logo"}
              style={{ height: 70, width: 70, marginBottom: 24, alignSelf: "center" }}
            />
            <Text
              weight="semibold"
              size="xl"
              tx="new_signup.title"
              style={{ textAlign: "center", marginBottom: 4 }}
            />

            <Text preset="label" size="medium" tx="login.title" style={{ textAlign: "center" }} />

            {loginMethod === LOGIN_METHOD.NONE && !initEmail && (
              <>
                <SocialLogin
                  isSingIn
                  onLoggedIn={onLoggedIn}
                  setIsLoading={setIsLoading}
                  style={{
                    marginTop: 32,
                    marginBottom: 24,
                  }}
                />

                <DividerText
                  tx="login_email_code.or"
                  style={{ marginHorizontal: 8 }}
                  color={colors.secondaryText}
                  size="base"
                />
              </>
            )}

            <TextInput
              animated
              isError={isError}
              label={translate("login.email_or_username")}
              value={username}
              keyboardType="email-address"
              onChangeText={(val) => {
                if (loginMethod !== LOGIN_METHOD.NONE) {
                  setLoginMethod(LOGIN_METHOD.NONE)
                }
                setUsername(val)
              }}
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            {/* Password input */}
            {loginMethod === LOGIN_METHOD.PASSWORD && (
              <Animated.View entering={FadeInUp}>
                <TextInput
                  ref={passwordRef}
                  animated
                  isPassword
                  isError={isError}
                  label={translate("common.password")}
                  onChangeText={setPassword}
                  value={password}
                  onSubmitEditing={() => {
                    handlePasswordLogin(username, password)
                  }}
                />
                <View
                  style={{
                    width: "100%",
                    alignItems: "flex-start",
                    marginTop: 4,
                  }}
                >
                  <TouchableOpacity onPress={handleForgot}>
                    <Text text={translate("login.forgot_password")} color={colors.link} />
                  </TouchableOpacity>
                </View>
                <Button
                  loading={loginMethodLoading === LOGIN_METHOD.PASSWORD || isLoading}
                  disabled={loginMethodLoading !== LOGIN_METHOD.NONE || !(username && password)}
                  text={translate("common.signin")}
                  onPress={() => {
                    handlePasswordLogin(username, password)
                  }}
                  style={{
                    marginVertical: 20,
                  }}
                />
              </Animated.View>
            )}
            {/* Password input end */}

            {loginMethod !== LOGIN_METHOD.PASSWORD && (
              <Button
                loading={isLoading}
                disabled={!username}
                text={translate("login_email_code.sign_in_email")}
                onPress={getLoginMethod}
                style={{
                  marginVertical: 16,
                }}
              />
            )}

            {(loginMethod === LOGIN_METHOD.PASSWORD || !!initEmail) && (
              <>
                <DividerText tx="login_email_code.or" style={{ marginHorizontal: 8 }} size="base" />
                <SocialLogin
                  isSingIn
                  onLoggedIn={onLoggedIn}
                  setIsLoading={setIsLoading}
                  style={{
                    marginTop: 16,
                    marginBottom: 12,
                  }}
                />
              </>
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginVertical: 12,
              }}
            >
              <Text
                preset="label"
                size="base"
                text={translate("login.no_account")}
                style={{
                  marginRight: 8,
                }}
              />
              <Text
                size="base"
                color={colors.primary}
                text={translate("common.sign_up")}
                onPress={() => navigation.replace("signupStack", { screen: "signup" })}
              />
            </View>
          </View>
        </View>
      </Screen>
    )
  },
)
