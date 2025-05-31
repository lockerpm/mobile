import React, { useState, useEffect, useRef, useCallback, FC } from "react"
import { BackHandler, TouchableOpacity, View, StyleSheet } from "react-native"
import { useStores } from "app/models"
import { useAppLocale, useTheme } from "app/services/context"
import { Screen, Text, Button, TextInput, Logo, Header } from "app/components/cores"
import {
  SocialLogin,
  RecaptchaChecker,
  DividerText,
  SetLanguage,
  RecaptchaCheckerRef,
} from "app/components/utils"
import { getCookies, logRegisterSuccessEvent } from "app/utils/analytics"
import { validateEmail } from "app/utils/utils"
import { observer } from "mobx-react-lite"
import { SignUpScreenProps } from "app/navigators"
import { useToast } from "app/services/utils"
import { openPrivacyPolicy, openTerms } from "app/utils/externalLink"
import { CommonActions } from "@react-navigation/native"
import { useLoggedIn } from "../../../hook/useLoggedIn"

export const SignUpWithPassword: FC<SignUpScreenProps<"signupPassword">> = observer(
  ({ navigation, route: { params } }) => {
    const { colors } = useTheme()
    const { user } = useStores()
    const { notifyTx, notifyApiError } = useToast()
    const { translate } = useAppLocale()

    // ---------------- PARAMS ---------------------

    const captchaRef = useRef<RecaptchaCheckerRef>(null)

    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState(params.email || "")
    const [fullname, setFullname] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    // ---------------- COMPUTED ---------------------

    const formValidated =
      validateEmail(email) && password && password === confirmPassword && fullname

    // ---------------- METHODS ---------------------
    const { onLoggedIn } = useLoggedIn()

    const navigateLogin = () => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: "unAuthStack",
              params: { screen: "loginStack", params: { screen: "login" } },
            },
          ],
        }),
      )
    }

    const getCaptchaToken = useCallback(async () => {
      return (await captchaRef.current?.waitForToken()) || ""
    }, [])

    const handleRegister = async (captchaToken: string) => {
      if (captchaToken) {
        return
      }
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
        notifyTx("success", "signup.signup_successful")
        navigateLogin()
      } else {
        notifyApiError(res)
      }
    }

    // ---------------- EFFECT --------------------

    useEffect(() => {
      const listener = BackHandler.addEventListener("hardwareBackPress", () => {
        navigateLogin()
        return true
      })

      return () => listener.remove()
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

        <View style={styles.container}>
          <Logo preset={"cystack-logo"} style={styles.logo} />
          <Text weight="semibold" size="xl" tx="new_signup.title" style={styles.title} />
          <Text preset="label" size="medium" tx="new_signup.sub_title" style={styles.centerText} />
          <TextInput isRequired animated labelTx="common.email" onChangeText={setEmail} />
          <TextInput isRequired animated labelTx="common.fullname" onChangeText={setFullname} />
          <TextInput
            animated
            isRequired
            isPassword
            labelTx="common.password"
            onChangeText={setPassword}
          />
          <TextInput
            animated
            isRequired
            isPassword
            label={translate("signup.confirm_password")}
            onChangeText={setConfirmPassword}
          />
          <Text size="base" style={styles.termContainer}>
            {translate("signup.agree_with") + " "}
            <Text size="base" color={colors.link} tx="signup.terms" onPress={openTerms} />
            <Text size="base" text={" " + translate("common.and") + " "} />
            <Text
              size="base"
              tx="signup.conditions"
              color={colors.link}
              onPress={openPrivacyPolicy}
            />
          </Text>

          <Button
            loading={isLoading}
            disabled={isLoading || !formValidated}
            tx="common.sign_up"
            onPress={() => {
              getCaptchaToken().then(handleRegister)
            }}
            style={styles.signUpEmail}
          />

          <DividerText
            tx="new_signup.sign_up_with"
            style={styles.mh8}
            color={colors.secondaryText}
            size="base"
          />

          <SocialLogin
            isSingIn={false}
            onLoggedIn={onLoggedIn}
            setIsLoading={setIsLoading}
            style={styles.signUpEmail}
          />

          <View style={styles.term}>
            <Text size="base" preset="label" tx="new_signup.has_account" />

            <TouchableOpacity onPress={navigateLogin}>
              <Text size="base" weight="medium" color={colors.primary} tx="new_signup.sign_in" />
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    )
  },
)

const styles = StyleSheet.create({
  centerSignupBussinessText: {
    marginVertical: 12,
    textAlign: "center",
  },
  centerText: {
    textAlign: "center",
  },
  container: {
    paddingHorizontal: 20,
  },
  logo: {
    alignSelf: "center",
    height: 70,
    marginBottom: 10,
    width: 70,
  },
  mh8: { marginHorizontal: 8 },
  signUpEmail: {
    marginBottom: 20,
    width: "100%",
  },
  term: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  termContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 8,
    marginTop: 10,
  },
  title: {
    marginBottom: 4,
    textAlign: "center",
  },
})
