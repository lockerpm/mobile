import React, { FC, useCallback, useEffect, useRef, useState } from "react"
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
import { LOGIN_METHOD, User2FAConfig } from "app/static/types"
import { useWebAuth } from "./useWebAuth"
import { useLoginPassword } from "./useLoginPassword"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import Animated, { FadeInUp } from "react-native-reanimated"
import { useToast } from "app/services/utils"
import { useLoggedIn } from "../../../hook/useLoggedIn"

export const LoginScreen: FC<LoginScreenProps<"login">> = observer(
  ({ navigation, route: { params } }) => {
    const { user } = useStores()
    const { colors } = useTheme()
    const { setApiTokens } = useHelper()
    const { notifyApiError } = useToast()
    const { translate } = useAppLocale()

    const initMethod = params?.initMethod
    const initEmail = params?.email || ""
    // ------------------------------ PARAMS -------------------------------

    const [credential, setCredential] = useState<User2FAConfig>({
      username: "",
      password: "",
      methods: [],
    })
    const [isShow2FASheet, setIsShow2FASheet] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const [username, setUsername] = useState(initEmail)
    const [password, setPassword] = useState("")
    const [loginMethodLoading, setLoginMethodLoading] = useState<LOGIN_METHOD>(LOGIN_METHOD.NONE)
    const [isTextInputForcus, setIsTextInputFocus] = useState<LOGIN_METHOD>(LOGIN_METHOD.NONE)

    const [loginMethod, setLoginMethod] = useState<LOGIN_METHOD>(initMethod || LOGIN_METHOD.NONE)

    const [isShowCreatePasskeyOptions, setIsShowCreatePasskeyOptions] = useState(false)
    const [isIcloudSelected, setIsIcloudSelected] = useState(true)

    const passwordRef = useRef<any>(null)
    const enableLoginByPassword = useRef(true)

    // ------------------------------ METHODS -------------------------------
    const { onLoggedIn } = useLoggedIn()

    const handleForgot = useCallback(() => {
      navigation.navigate("forgotPassword", {
        email: "",
      })
    }, [])

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
      setIsLoading(false)
      if (data.is_factor2) {
        setCredential({ username, password, methods: data.methods })
        setIsShow2FASheet(true)
      } else {
        setApiTokens(data.access_token)
        onLoggedIn()
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
      <Screen preset="auto" padding safeAreaEdges={["top", "bottom"]} keyboardOffset={0}>
        <TwoFAAuthenSheet
          credential={credential}
          isOpen={isShow2FASheet}
          onClose={() => {
            setIsShow2FASheet(false)
          }}
          onLoggedIn={onLoggedIn}
        />
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
        <View style={{ alignItems: "flex-end" }}>
          <SetLanguage />
        </View>
        <Logo preset={"cystack-logo"} style={styles.logo} />
        <Text weight="semibold" size="xl" tx="new_signup.title" style={styles.title} />

        <Text preset="label" size="medium" tx="login.title" style={styles.label} />

        {loginMethod === LOGIN_METHOD.NONE && !initEmail && (
          <>
            <SocialLogin
              isSingIn
              onLoggedIn={onLoggedIn}
              setIsLoading={setIsLoading}
              style={styles.social}
            />

            <DividerText
              tx="login_email_code.or"
              style={styles.divider}
              color={colors.secondaryText}
              size="base"
            />
          </>
        )}

        <TextInput
          animated
          isError={isError}
          autoCapitalize="none"
          autoCorrect={false}
          labelTx="login.email_or_username"
          keyboardType="email-address"
          value={username}
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
              value={password}
              labelTx="common.password"
              onChangeText={setPassword}
              onSubmitEditing={() => {
                handlePasswordLogin(username, password)
              }}
            />

            <TouchableOpacity onPress={handleForgot} style={styles.forgotPW}>
              <Text text={translate("login.forgot_password")} color={colors.link} />
            </TouchableOpacity>
            <Button
              loading={loginMethodLoading === LOGIN_METHOD.PASSWORD || isLoading}
              disabled={loginMethodLoading !== LOGIN_METHOD.NONE || !(username && password)}
              tx={"common.signin"}
              onPress={() => {
                handlePasswordLogin(username, password)
              }}
              style={styles.mv20}
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
            style={styles.mv20}
          />
        )}

        {(loginMethod === LOGIN_METHOD.PASSWORD || !!initEmail) && (
          <>
            <DividerText tx="login_email_code.or" style={styles.divider} size="base" />
            <SocialLogin
              isSingIn
              onLoggedIn={onLoggedIn}
              setIsLoading={setIsLoading}
              style={styles.socialPassword}
            />
          </>
        )}

        <View style={styles.noAccount}>
          <Text
            preset="label"
            size="base"
            text={translate("login.no_account")}
            style={styles.mr8}
          />
          <TouchableOpacity onPress={navigateToSignup}>
            <Text size="base" color={colors.primary} text={translate("common.sign_up")} />
          </TouchableOpacity>
        </View>
      </Screen>
    )
  },
)

const styles = StyleSheet.create({
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
