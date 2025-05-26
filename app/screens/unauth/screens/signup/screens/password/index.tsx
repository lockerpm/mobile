import React, { useState, useEffect, useRef, useCallback, FC } from "react"
import { BackHandler, Linking, TouchableOpacity, View } from "react-native"
import { useStores } from "app/models"
import { useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"
import { Screen, Text, Button, TextInput, Logo, Header } from "app/components/cores"
import { SocialLogin, RecaptchaChecker, DividerText, SetLanguage } from "app/components/utils"
import { getCookies, logRegisterSuccessEvent } from "app/utils/analytics"
import { Logger, validateEmail } from "app/utils/utils"
import { observer } from "mobx-react-lite"
import { PRIVACY_POLICY_URL, TERMS_URL } from "app/config/constants"
import { SignUpScreenProps } from "../../route"

export const SignUpWithPassword: FC<SignUpScreenProps<"signupPassword">> = observer(
  ({ navigation, route: { params } }) => {
    const { colors } = useTheme()
    const { user } = useStores()
    const { notify, notifyApiError, translate } = useHelper()

    // ---------------- PARAMS ---------------------

    const captchaRef = useRef(null)

    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState(params.email || "")
    const [fullname, setFullname] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    // ---------------- COMPUTED ---------------------

    const formValidated =
      validateEmail(email) && password && password === confirmPassword && fullname

    // ---------------- METHODS ---------------------

    const navigateLogin = () => {
      navigation.replace("login")
    }

    const getCaptchaToken = useCallback(async () => {
      return await captchaRef.current.waitForToken()
    }, [])

    const handleRegister = async (captchaToken: string) => {
      setIsLoading(true)
      const res = await user.register({
        email,
        password,
        country: "vi",
        confirm_password: confirmPassword,
        full_name: fullname,
        phone: undefined,
        request_code: captchaToken,
        scope: "pwdmanager",
        utm_source: await getCookies("utm_source"),
      })
      setIsLoading(false)
      if (res.kind === "ok") {
        logRegisterSuccessEvent()
        notify("success", translate("signup.signup_successful"), 5000)
        navigation.replace("login")
      } else {
        notifyApiError(res)
      }
    }

    const onLoggedIn = async (_newUser: boolean, _token: string) => {
      const [userRes, userPwRes] = await Promise.all([user.getUser(), user.getUserPw()])
      if (userRes.kind === "ok" && userPwRes.kind === "ok") {
        if (user.is_pwd_manager) {
          navigation.navigate("lock")
        } else {
          navigation.navigate("createMasterPassword")
        }
      }
    }

    // ---------------- EFFECT --------------------

    useEffect(() => {
      const onBackPress = () => {
        navigation.replace("login")
        return true
      }

      BackHandler.addEventListener("hardwareBackPress", onBackPress)

      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress)
    }, [navigation])
    // ---------------- RENDER ---------------------

    return (
      <Screen
        preset="auto"
        safeAreaEdges={["bottom"]}
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            RightActionComponent={<SetLanguage />}
          />
        }
      >
        <RecaptchaChecker ref={captchaRef} />

        <View style={{ paddingHorizontal: 20 }}>
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

          <Text
            preset="label"
            size="medium"
            tx="new_signup.sub_title"
            style={{ textAlign: "center" }}
          />

          <TextInput
            isRequired
            animated
            label={translate("common.email")}
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            isRequired
            animated
            label={translate("common.fullname")}
            value={fullname}
            onChangeText={setFullname}
          />

          <TextInput
            animated
            isRequired
            isPassword
            label={translate("common.password")}
            onChangeText={setPassword}
            value={password}
          />
          <TextInput
            animated
            isRequired
            isPassword
            label={translate("signup.confirm_password")}
            onChangeText={setConfirmPassword}
            value={confirmPassword}
          />

          <Text size="base" style={{ textAlign: "center", marginTop: 24, marginBottom: 12 }}>
            {translate("signup.agree_with") + " "}
            <Text
              size="base"
              color={colors.link}
              text={translate("signup.terms")}
              onPress={() => {
                Linking.canOpenURL(TERMS_URL)
                  .then((val) => {
                    if (val) Linking.openURL(TERMS_URL)
                  })
                  .catch((e) => Logger.error(e))
              }}
            />
            <Text size="base" text={" " + translate("common.and") + " "} />
            <Text
              size="base"
              text={translate("signup.conditions")}
              color={colors.link}
              onPress={() => {
                Linking.canOpenURL(PRIVACY_POLICY_URL)
                  .then((val) => {
                    if (val) Linking.openURL(PRIVACY_POLICY_URL)
                  })
                  .catch((e) => Logger.error(e))
              }}
            />
          </Text>

          <Button
            loading={isLoading}
            disabled={isLoading || !formValidated}
            text={translate("common.sign_up")}
            onPress={() => {
              getCaptchaToken().then(handleRegister)
            }}
            style={{
              width: "100%",
              marginBottom: 20,
            }}
          />

          <DividerText
            tx="new_signup.sign_up_with"
            style={{ marginHorizontal: 8 }}
            color={colors.secondaryText}
            size="base"
          />

          <SocialLogin
            isSingIn={false}
            onLoggedIn={onLoggedIn}
            setIsLoading={setIsLoading}
            style={{
              marginVertical: 12,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text size="base" preset="label" tx="new_signup.has_account" />

            <TouchableOpacity onPress={navigateLogin}>
              <Text
                size="base"
                weight="medium"
                style={{ color: colors.primary }}
                tx="new_signup.sign_in"
              />
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    )
  },
)
