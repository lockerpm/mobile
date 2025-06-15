import React, { useState, useEffect, FC, useCallback } from "react"
import { BackHandler, Platform, StyleSheet, TouchableOpacity, View } from "react-native"
import { useAppLocale, useTheme } from "app/services/context"
import { Screen, Text, Button, TextInput, Logo, Checkbox } from "app/components/cores"
import { SocialLogin, IosPasswordlessOptions, DividerText, SetLanguage } from "app/components/utils"
import { Passkey } from "react-native-passkey"
import { validateEmail } from "app/utils/utils"
import { SignUpScreenProps } from "app/navigators"
import { openPrivacyPolicy, openRegisterBusiness, openTerms } from "app/utils/externalLink"
import { useSignupWebauth } from "./useWebauth"
import { useLoggedIn } from "../../../hook/useLoggedIn"

const IS_IOS = Platform.OS === "ios"

export const SignupScreen: FC<SignUpScreenProps<"signup">> = ({ navigation }) => {
  const { colors } = useTheme()
  const { translate } = useAppLocale()

  // ---------------- PARAMS ---------------------
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [getNews, setGesNews] = useState(false)
  const [isShowCreatePasskeyOptions, setIsShowCreatePasskeyOptions] = useState(false)
  const [isIcloudSelected, setIsIcloudSelected] = useState(true)

  // ---------------- COMPUTED ---------------------
  const fullname = email.replace(/[^a-zA-Z ]/g, "")
  const isEmail = validateEmail(email)

  // ---------------- METHODS ---------------------
  const { onLoggedIn } = useLoggedIn()

  const navigateLogin = useCallback(() => {
    navigation.replace("loginStack", {
      screen: "login",
    })
  }, [])

  const onRegisterWithPinCode = useCallback(() => {
    navigation.navigate("signupPinCode", {
      email,
      getNews,
    })
  }, [])

  const { handleRegisterWebauth } = useSignupWebauth({
    setIsLoading,
    navigateLogin,
    onRegisterWithPinCode,
  })

  const onRegisterWebauth = async () => {
    setIsShowCreatePasskeyOptions(false)

    if (isIcloudSelected) {
      handleRegisterWebauth(email, fullname)
    } else {
      handleRegisterWebauth(email, fullname, true)
    }
  }
  const onRegister = () => {
    if (Passkey.isSupported()) {
      if (Platform.OS === "ios") {
        setIsShowCreatePasskeyOptions(true)
      } else {
        handleRegisterWebauth(email, fullname)
      }
    } else {
      onRegisterWithPinCode()
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
    <Screen preset="scroll" padding safeAreaEdges={["top", "bottom"]} keyboardOffset={0}>
      {IS_IOS && (
        <IosPasswordlessOptions
          isOpen={isShowCreatePasskeyOptions}
          onClose={() => {
            setIsShowCreatePasskeyOptions(false)
            onRegisterWithPinCode()
          }}
          title={translate("common.sign_up")}
          label={translate("passkey.sign_up.passkey_options")}
          isIcloudSelected={isIcloudSelected}
          setIsIcloudSelected={setIsIcloudSelected}
          action={onRegisterWebauth}
        />
      )}

      <View style={styles.setLanguage}>
        <SetLanguage />
      </View>
      <Logo preset="cystack-logo" style={styles.logo} />
      <Text weight="semibold" size="xl" tx="new_signup.title" style={styles.title} />

      <Text preset="label" size="medium" tx="new_signup.sub_title" style={styles.centerText} />

      <SocialLogin
        isSingIn={false}
        onLoggedIn={onLoggedIn}
        setIsLoading={setIsLoading}
        style={styles.social}
      />

      <DividerText
        tx="new_signup.other_signup"
        style={styles.mh8}
        color={colors.secondaryText}
        size="base"
      />

      <TextInput isRequired animated labelTx="common.email" onChangeText={setEmail} />

      <TermAndConditions agreed={getNews} setAgreed={setGesNews} />

      <Text size="base">
        {translate("signup.agree_with") + " "}
        <Text size="base" color={colors.primary} tx="signup.terms" onPress={openTerms} />
        <Text size="base" text={" " + translate("common.and") + " "} />
        <Text
          size="base"
          tx="signup.conditions"
          color={colors.primary}
          onPress={openPrivacyPolicy}
        />
      </Text>

      <Button
        loading={isLoading}
        disabled={isLoading || !isEmail}
        tx="new_signup.sign_up_email"
        onPress={onRegister}
        style={styles.signUpEmail}
      />

      <Text size="base" preset="label" style={styles.centerSignupBussinessText}>
        {translate("new_signup.sign_up_business.title")}
        <Text
          weight="medium"
          size="base"
          color={colors.primary}
          onPress={openRegisterBusiness}
          tx="new_signup.sign_up_business.free_trial"
        />
      </Text>

      <Text size="base" preset="label" style={styles.centerText}>
        {translate("new_signup.has_account")}
        <Text
          size="base"
          weight="medium"
          onPress={navigateLogin}
          color={colors.primary}
          tx="new_signup.sign_in"
        />
      </Text>
    </Screen>
  )
}

const TermAndConditions = ({
  agreed,
  setAgreed,
}: {
  agreed: boolean
  setAgreed: (val: boolean) => void
}) => {
  return (
    <View style={styles.termContainer}>
      <Checkbox value={agreed} onValueChange={setAgreed} />
      <TouchableOpacity onPress={() => setAgreed(!agreed)}>
        <Text tx={"new_signup.marketing"} size="base" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  centerSignupBussinessText: {
    marginVertical: 12,
    textAlign: "center",
  },
  centerText: {
    textAlign: "center",
  },
  logo: {
    alignSelf: "center",
    height: 70,
    marginBottom: 10,
    width: 70,
  },
  mh8: { marginHorizontal: 8 },
  setLanguage: {
    alignItems: "flex-end",
  },
  signUpEmail: {
    marginBottom: 20,
    marginTop: 24,
    width: "100%",
  },
  social: {
    marginBottom: 24,
    marginTop: 32,
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
