import { FC, useCallback, useEffect, useRef, useState } from "react"
import { useStores } from "app/models"
import { api } from "app/services/api"
import { Passkey } from "react-native-passkey"
import { Button, Logo, Screen, Text, TextInput } from "app/components/cores"
import { useHelper } from "app/services/hook"
import { observer } from "mobx-react-lite"
import { DividerText, IosPasswordlessOptions, SetLanguage, SocialLogin } from "app/components/utils"
import { LoginScreenProps } from "app/navigators"
import { LoginOptions, User2FAPasswordConfig, User2FAMethod } from "app/static/types"
import { useWebAuth } from "./useWebAuth"
import { useLoginPassword } from "./useLoginPassword"
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native"
import Animated, { FadeInUp } from "react-native-reanimated"
import { useToast } from "app/services/utils"
import { useLoggedIn } from "../../../hook/useLoggedIn"
import { useAppTheme } from "@/utils/useAppTheme"
import Config from "react-native-config"

const IS_IOS = Platform.OS === "ios"

export const LoginScreen: FC<LoginScreenProps<"login">> = observer(
  ({ navigation, route: { params } }) => {
    const { user } = useStores()
    const {
      theme: { colors },
    } = useAppTheme()
    const { setApiTokens } = useHelper()
    const { notifyApiError } = useToast()

    const initMethod = params?.initMethod
    const initEmail = params?.email || ""
    // ------------------------------ PARAMS -------------------------------

    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const [username, setUsername] = useState(initEmail)
    const [password, setPassword] = useState("")
    const [loginMethodLoading, setLoginMethodLoading] = useState<LoginOptions>(LoginOptions.NONE)
    const [loginMethod, setLoginMethod] = useState<LoginOptions>(initMethod || LoginOptions.NONE)
    const [isShowCreatePasskeyOptions, setIsShowCreatePasskeyOptions] = useState(false)

    const passwordRef = useRef<any>(null)
    const enableLoginByPassword = useRef(true)

    // ------------------------------ METHODS -------------------------------
    const { onLoggedIn } = useLoggedIn()

    const navigateTo2FA = useCallback(
      (credential: User2FAPasswordConfig) => {
        navigation.navigate("twoFA", {
          credential,
          type: "password",
        })
      },
      [navigation]
    )

    const navigateToForgot = useCallback(() => {
      navigation.navigate("forgotPasswordStack", {
        screen: "methodSelect",
      })
    }, [navigation])

    const navigateToSignup = useCallback(() => {
      navigation.replace("signupStack", { screen: "signup" })
    }, [navigation])

    const onGoToPinCode = () => {
      navigation.replace("loginByPincode", {
        email: username,
        havePassword: enableLoginByPassword.current,
      })
    }

    const getLoginMethod = async () => {
      setIsLoading(true)
      const res = await user.loginMethod(username)
      if (res.kind === "ok") {
        if (res.data.webauthn && Passkey.isSupported()) {
          setLoginMethod(LoginOptions.PASSKEY)
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
      setIsLoading(false)
    }

    const handleLoginSuccess = (data: {
      is_factor2: boolean
      methods: User2FAMethod[]
      access_token: string
    }) => {
      setIsLoading(false)
      if (data.is_factor2) {
        navigateTo2FA({ username, password, methods: data.methods })
      } else {
        setApiTokens(data.access_token)
        onLoggedIn()
        setPassword("")
      }
    }

    const { handleWebAuthLogin } = useWebAuth({
      setLoginMethodLoading,
      onGoToPinCode,
      handleLoginSuccess,
    })

    const { handlePasswordLogin } = useLoginPassword({
      setLoginMethodLoading,
      setIsError,
      handleLoginSuccess,
    })

    // -------------- EFFECT ------------------

    useEffect(() => {
      user.setOnPremiseUser(false)
      api.apisauce.setBaseURL(Config.BASE_URL)
    }, [user])

    // ------------------------------ RENDER -------------------------------

    return (
      <Screen
        preset="auto"
        safeAreaEdges={["top", "bottom"]}
        keyboardOffset={12}
        contentContainerStyle={styles.container}
      >
        {IS_IOS && (
          <IosPasswordlessOptions
            isOpen={isShowCreatePasskeyOptions}
            onClose={() => {
              setIsShowCreatePasskeyOptions(false)
              onGoToPinCode()
            }}
            labelTx={"passkey:login_passkey_options"}
            titleTx={"common:signin"}
            action={async (isIcloudSelected: boolean) => {
              setIsShowCreatePasskeyOptions(false)
              await handleWebAuthLogin(username, !isIcloudSelected)
            }}
          />
        )}
        <View style={styles.setLanguage}>
          <SetLanguage />
        </View>
        <Logo preset={"cystack-logo"} style={styles.logo} />
        <Text weight="semiBold" size="xl" tx="new_signup:title" style={styles.title} />

        <Text preset="label" size="md" tx="login:title" style={styles.label} />

        {loginMethod === LoginOptions.NONE && !initEmail && (
          <>
            <SocialLogin
              isSingIn
              onLoggedIn={onLoggedIn}
              setIsLoading={setIsLoading}
              style={styles.social}
            />

            <DividerText
              tx="login_email_code:or"
              style={styles.divider}
              color={colors.label}
              size="sm"
            />
          </>
        )}

        <TextInput
          animated
          isError={isError}
          autoCapitalize="none"
          autoCorrect={false}
          labelTx="login:email_or_username"
          keyboardType="email-address"
          value={username}
          onChangeText={(val) => {
            if (loginMethod !== LoginOptions.NONE) {
              setLoginMethod(LoginOptions.NONE)
            }
            setUsername(val)
          }}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        {/* Password input */}
        {loginMethod === LoginOptions.PASSWORD && (
          <Animated.View entering={FadeInUp}>
            <TextInput
              ref={passwordRef}
              animated
              isPassword
              isError={isError}
              value={password}
              labelTx="common:password"
              onChangeText={setPassword}
              onSubmitEditing={() => {
                handlePasswordLogin(username, password)
              }}
            />

            <TouchableOpacity onPress={navigateToForgot} style={styles.forgotPW}>
              <Text tx={"login:forgot_password"} color={colors.link} />
            </TouchableOpacity>
            <Button
              loading={loginMethodLoading === LoginOptions.PASSWORD || isLoading}
              disabled={loginMethodLoading !== LoginOptions.NONE || !(username && password)}
              tx={"common:signin"}
              onPress={() => {
                handlePasswordLogin(username, password)
              }}
              style={styles.mv20}
            />
          </Animated.View>
        )}
        {/* Password input end */}

        {loginMethod !== LoginOptions.PASSWORD && (
          <Button
            loading={isLoading}
            disabled={!username}
            tx={"login_email_code:sign_in_email"}
            onPress={getLoginMethod}
            style={styles.mv20}
          />
        )}

        {(loginMethod === LoginOptions.PASSWORD || !!initEmail) && (
          <>
            <DividerText tx="login_email_code:or" style={styles.divider} size="sm" />
            <SocialLogin
              isSingIn
              onLoggedIn={onLoggedIn}
              setIsLoading={setIsLoading}
              style={styles.socialPassword}
            />
          </>
        )}

        <View style={styles.noAccount}>
          <Text preset="label" size="sm" tx={"login:no_account"} style={styles.mr8} />
          <TouchableOpacity onPress={navigateToSignup}>
            <Text size="sm" color={colors.primary} tx={"common:sign_up"} />
          </TouchableOpacity>
        </View>
      </Screen>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  divider: {
    marginHorizontal: 8,
  },
  forgotPW: {
    alignItems: "flex-start",
    marginTop: 4,
    width: "100%",
  },
  label: {
    textAlign: "center",
  },
  logo: {
    alignSelf: "center",
    height: 70,
    marginBottom: 24,
    width: 70,
  },
  mr8: {
    marginRight: 8,
  },
  mv20: {
    marginVertical: 16,
  },
  noAccount: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 12,
  },
  setLanguage: {
    alignItems: "flex-end",
  },
  social: {
    marginBottom: 24,
    marginTop: 32,
  },
  socialPassword: {
    marginBottom: 12,
    marginTop: 16,
  },
  title: {
    marginBottom: 4,
    textAlign: "center",
  },
})
