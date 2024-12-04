import React, { useState, useRef, useEffect } from "react"
import { Platform, TouchableOpacity, View } from "react-native"
import { useStores } from "app/models"
import { Passkey, PasskeyAuthenticationResult } from "react-native-passkey"
import { PasskeyAuthenticationRequest } from "react-native-passkey/lib/typescript/Passkey"
import { credentialAuthOptions, publicKeyCredentialWithAssertion } from "app/utils/passkey"
import { DividerText, IosPasswordlessOptions, SocialLogin } from "app/components/utils"
import { useHelper } from "app/services/hook"
import { Logo, Text, Button, TextInput } from "app/components/cores"
import Animated, { FadeInUp } from "react-native-reanimated"
import { useTheme } from "app/services/context"
import { LOGIN_METHOD } from "app/static/types"
import { useNavigation, useRoute } from "@react-navigation/native"
import { RootStackScreenProps } from "app/navigators/navigators.types"
import { observer } from "mobx-react-lite"

type Props = {
  isLoading: boolean
  setIsLoading: (val: boolean) => void
  nextStep: (username: string, password: string, methods: { type: string; data: any }[]) => void
  onLoggedIn: (newUser: boolean, token: string) => Promise<void>
  handleForgot: () => void
}

const IS_IOS = Platform.OS === "ios"

export const LoginForm = observer(
  ({ nextStep, onLoggedIn, handleForgot, isLoading, setIsLoading }: Props) => {
    const { params }: RootStackScreenProps<"login">["route"] = useRoute()
    const navigation: RootStackScreenProps<"login">["navigation"] = useNavigation()

    const { user } = useStores()
    const { colors } = useTheme()
    const { notify, notifyApiError, setApiTokens, translate } = useHelper()
    const initMethod = params?.initMethod

    // ------------------ Params -----------------------

    const passwordRef = useRef(null)

    const [isError, setIsError] = useState(false)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loginMethodLoading, setLoginMethodLoading] = useState<LOGIN_METHOD>(LOGIN_METHOD.NONE)

    const [loginMethod, setLoginMethod] = useState<LOGIN_METHOD>(LOGIN_METHOD.NONE)
    const [passkeySupported, setPasskeySupported] = useState(false)
    const [showExtraPasskeyLogin, setShowExtraPasskeyLogin] = useState(false)

    const [isShowCreatePasskeyOptions, setIsShowCreatePasskeyOptions] = useState(false)
    const [isIcloudSelected, setIsIcloudSelected] = useState(true)

    const enableLoginByPassword = useRef(true)
    // ------------------ Methods ----------------------

    const onGoToPinCode = () => {
      navigation.navigate("login_by_pincode", {
        email: username,
        havePassword: enableLoginByPassword.current,
      })
    }

    const getLoginMethod = async () => {
      const res = await user.loginMethod(username)
      if (res.kind === "ok") {
        if (res.data.webauthn) {
          setLoginMethod(LOGIN_METHOD.PASSKEY)
          if (IS_IOS) {
            setIsShowCreatePasskeyOptions(true)
          } else {
            await handleAuthWebauth()
          }
          setShowExtraPasskeyLogin(true)
          return
        }
        if (res.data.is_random_password) {
          enableLoginByPassword.current = false
        }
        // setLoginMethod(LOGIN_METHOD.PASSWORD)
        onGoToPinCode()
      } else {
        notifyApiError(res)
      }
    }

    const handleLogin = async () => {
      setLoginMethodLoading(LOGIN_METHOD.PASSWORD)
      setIsError(false)

      const payload = { username, password }
      const res = await user.login(payload)
      setLoginMethodLoading(LOGIN_METHOD.NONE)
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
        if (res.data.is_factor2) {
          nextStep(username, password, res.data.methods)
        } else {
          setPassword("")
          // @ts-ignore
          setApiTokens(res.data?.access_token)
          onLoggedIn(false, "")
        }
      }
    }

    const handleAuthWebauth = async (withSecurityKey?: boolean) => {
      setLoginMethodLoading(LOGIN_METHOD.PASSKEY)
      const resAuthPasskeyOptions = await user.authPasskeyOptions(username)
      if (resAuthPasskeyOptions.kind === "ok") {
        try {
          const authRequest: PasskeyAuthenticationRequest = credentialAuthOptions(
            resAuthPasskeyOptions.data,
          )
          // Call the `authenticate` method with the retrieved request in JSON format
          // A native overlay will be displayed
          const result: PasskeyAuthenticationResult = await Passkey.authenticate(authRequest, {
            withSecurityKey,
          })

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

            // setLoginMethod(LOGIN_METHOD.PASSWORD)
            onGoToPinCode()
          }
          // The `authenticate` method returns a FIDO2 assertion result
          // Pass it to your server for verification
        } catch (error) {
          // Handle Error...
          if (error.error === "UserCancelled") {
            notify("error", translate("passkey.error.user_cancel"))
          } else if (error.error === "NotCredentials") {
            notify("error", translate("passkey.error.no_credential"))
          } else {
            notify("error", translate("error.something_went_wrong"))
          }

          // setLoginMethod(LOGIN_METHOD.PASSWORD)
          onGoToPinCode()
        }
      } else {
        notifyApiError(resAuthPasskeyOptions)
      }
      setLoginMethodLoading(LOGIN_METHOD.NONE)
    }
    const checkPasskeySupported = async () => {
      const res = await Passkey.isSupported()
      if (res) {
        setLoginMethod(LOGIN_METHOD.NONE)
        setPasskeySupported(true)
        return
      }
      // setLoginMethod(LOGIN_METHOD.PASSWORD)
      onGoToPinCode()
    }

    // ------------------------------ EFFECT -------------------------------

    useEffect(() => {
      checkPasskeySupported()
    }, [])

    useEffect(() => {
      if (initMethod && initMethod !== LOGIN_METHOD.NONE) {
        setLoginMethod(initMethod)
      }
    }, [initMethod])

    // ------------------------------ RENDER -------------------------------

    return (
      <View>
        <View>
          {IS_IOS && (
            <IosPasswordlessOptions
              isOpen={isShowCreatePasskeyOptions}
              onClose={() => {
                setIsShowCreatePasskeyOptions(false)
                onGoToPinCode()
                // setLoginMethod(LOGIN_METHOD.PASSWORD)
              }}
              label={translate("passkey.login_passkey_options")}
              title={translate("common.login")}
              isIcloudSelected={isIcloudSelected}
              setIsIcloudSelected={setIsIcloudSelected}
              action={async () => {
                setIsShowCreatePasskeyOptions(false)
                await handleAuthWebauth(!isIcloudSelected)
              }}
            />
          )}

          <Logo
            preset={"cystack-logo"}
            style={{ height: 70, width: 70, marginBottom: 10, alignSelf: "center" }}
          />
          <Text
            weight="semibold"
            size="xl"
            tx="new_signup.title"
            style={{ textAlign: "center", marginBottom: 4 }}
          />

          <Text preset="label" size="medium" tx="login.title" style={{ textAlign: "center" }} />

          {loginMethod === LOGIN_METHOD.NONE && (
            <>
              <SocialLogin
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
              if (passkeySupported && loginMethod !== LOGIN_METHOD.NONE) {
                setLoginMethod(LOGIN_METHOD.NONE)
                setShowExtraPasskeyLogin(false)
              }
              setUsername(val)
            }}
            onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
          />

          {/* Password input */}
          {loginMethod === LOGIN_METHOD.PASSWORD && (
            <Animated.View entering={FadeInUp}>
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
              >
                <TouchableOpacity onPress={handleForgot}>
                  <Text text={translate("login.forgot_password")} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <Button
                loading={loginMethodLoading === LOGIN_METHOD.PASSWORD || isLoading}
                disabled={loginMethodLoading !== LOGIN_METHOD.NONE || !(username && password)}
                text={translate("common.login")}
                onPress={handleLogin}
                style={{
                  marginVertical: 16,
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

          {showExtraPasskeyLogin && (
            <Button
              preset="secondary"
              loading={loginMethodLoading === LOGIN_METHOD.PASSKEY || isLoading}
              disabled={loginMethodLoading !== LOGIN_METHOD.NONE || !username}
              text={translate("passkey.login_passkey")}
              onPress={() => {
                if (Platform.OS === "ios") {
                  setIsShowCreatePasskeyOptions(true)
                } else {
                  handleAuthWebauth(false)
                }
              }}
              style={{
                height: 50,
                marginBottom: 12,
              }}
            />
          )}

          {loginMethod === LOGIN_METHOD.PASSWORD && (
            <>
              <DividerText
                tx="login_email_code.or"
                style={{ marginHorizontal: 8 }}
                color={colors.secondaryText}
                size="base"
              />
              <SocialLogin
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
              text={translate("login.no_account")}
              style={{
                marginRight: 8,
              }}
            />
            <TouchableOpacity onPress={() => navigation.navigate("signup")}>
              <Text color={colors.primary} text={translate("common.sign_up")} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  },
)
