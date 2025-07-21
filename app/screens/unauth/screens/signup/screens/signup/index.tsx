import { useState, useEffect, FC, useCallback, useRef } from "react"
import { BackHandler, Platform, StyleSheet, TouchableOpacity, View } from "react-native"
import {
  Screen,
  Text,
  Button,
  TextInput,
  Logo,
  Checkbox,
  PressableText,
} from "app/components/cores"
import { SocialLogin, IosPasswordlessOptions, DividerText, SetLanguage } from "app/components/utils"
import { Passkey } from "react-native-passkey"
import { validateEmail } from "app/utils/utils"
import { SignUpScreenProps } from "app/navigators"
import { useSignupWebauth } from "./useWebauth"
import { useLoggedIn } from "../../../hook/useLoggedIn"
import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"
import { openPrivacyPolicy, openRegisterBusiness, openTerms } from "@/utils/openLinkInBrowser"

const IS_IOS = Platform.OS === "ios"

export const SignupScreen: FC<SignUpScreenProps<"signup">> = ({ navigation }) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()

  // ---------------- PARAMS ---------------------
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [getNews, setGesNews] = useState(false)
  const [isShowCreatePasskeyOptions, setIsShowCreatePasskeyOptions] = useState(false)

  const emailRef = useRef<string>("")
  const getNewsRef = useRef<boolean>(false)
  // ---------------- COMPUTED ---------------------
  const fullname = email.replace(/[^a-zA-Z ]/g, "")
  const isEmail = validateEmail(email.trim())

  // ---------------- METHODS ---------------------
  const { onLoggedIn } = useLoggedIn()

  const onChangeEmail = useCallback((text: string) => {
    setEmail(text)
    emailRef.current = text.trim()
  }, [])

  const onChangeGetNews = useCallback((val: boolean) => {
    setGesNews(val)
    getNewsRef.current = val
  }, [])

  const navigateLogin = useCallback(() => {
    navigation.replace("loginStack", {
      screen: "login",
    })
  }, [navigation])

  const onRegisterWithPinCode = useCallback(() => {
    navigation.navigate("signupPinCode", {
      email: emailRef.current,
      getNews: getNewsRef.current,
    })
  }, [navigation])

  const { handleRegisterWebauth } = useSignupWebauth({
    setIsLoading,
    navigateLogin,
    onRegisterWithPinCode,
  })

  const onRegisterWebauth = async (isIcloudSelected: boolean) => {
    setIsShowCreatePasskeyOptions(false)

    if (isIcloudSelected) {
      handleRegisterWebauth(email, fullname)
    } else {
      handleRegisterWebauth(email, fullname, true)
    }
  }
  const onRegister = async () => {
    setIsLoading(true)
    if (Passkey.isSupported()) {
      if (Platform.OS === "ios") {
        setIsShowCreatePasskeyOptions(true)
      } else {
        await handleRegisterWebauth(email, fullname)
      }
    } else {
      onRegisterWithPinCode()
    }
    setIsLoading(false)
  }

  // ---------------- EFFECT --------------------

  useEffect(() => {
    const listener = BackHandler.addEventListener("hardwareBackPress", () => {
      navigateLogin()
      return true
    })
    return () => listener.remove()
  }, [navigateLogin, navigation])
  // ---------------- RENDER ---------------------

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      keyboardOffset={12}
      contentContainerStyle={styles.container}
    >
      {IS_IOS && (
        <IosPasswordlessOptions
          isOpen={isShowCreatePasskeyOptions}
          onClose={() => {
            setIsShowCreatePasskeyOptions(false)
            onRegisterWithPinCode()
          }}
          titleTx={"common:sign_up"}
          labelTx={"passkey:sign_up.passkey_options"}
          action={onRegisterWebauth}
        />
      )}

      <View style={styles.setLanguage}>
        <SetLanguage />
      </View>
      <Logo preset="cystack-logo" style={styles.logo} />
      <Text weight="semiBold" size="xl" tx="new_signup:title" style={styles.title} />

      <Text preset="label" size="md" tx="new_signup:sub_title" style={styles.centerText} />

      <SocialLogin
        isSingIn={false}
        onLoggedIn={onLoggedIn}
        setIsLoading={setIsLoading}
        style={styles.social}
      />

      <DividerText tx="new_signup:other_signup" style={styles.mh8} color={colors.label} size="sm" />

      <TextInput
        isRequired
        animated
        labelTx="common:email"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={email}
        onChangeText={onChangeEmail}
        onSubmitEditing={onRegister}
      />

      <TermAndConditions agreed={getNews} setAgreed={onChangeGetNews} />

      <View style={styles.term}>
        <Text size="sm" text={translate("signup:agree_with") + " "} />

        <PressableText size="sm" color={colors.primary} tx="signup:terms" onPress={openTerms} />
        <Text size="sm" text={" " + translate("common:and") + " "} />
        <PressableText
          size="sm"
          tx="signup:conditions"
          color={colors.primary}
          onPress={openPrivacyPolicy}
        />
      </View>

      <Button
        loading={isLoading}
        disabled={isLoading || !isEmail}
        tx="new_signup:sign_up_email"
        onPress={onRegister}
        style={styles.signUpEmail}
      />

      <View style={styles.pressableText}>
        <Text
          size="sm"
          preset="label"
          style={styles.centerSignupBussinessText}
          text={translate("new_signup:sign_up_business.title") + " "}
        />

        <PressableText
          weight="medium"
          size="sm"
          color={colors.primary}
          onPress={openRegisterBusiness}
          tx="new_signup:sign_up_business.free_trial"
        />
      </View>

      <View style={styles.pressableText}>
        <Text size="sm" preset="label" style={styles.centerText}>
          {translate("new_signup:has_account") + " "}
        </Text>
        <PressableText
          size="sm"
          weight="medium"
          onPress={navigateLogin}
          color={colors.primary}
          tx="new_signup:sign_in"
        />
      </View>
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
    <TouchableOpacity onPress={() => setAgreed(!agreed)}>
      <View style={styles.termContainer}>
        <Checkbox value={agreed} />
        <Text tx={"new_signup:marketing"} size="sm" style={styles.ml12} />
      </View>
    </TouchableOpacity>
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
  container: {
    paddingHorizontal: 16,
  },
  logo: {
    alignSelf: "center",
    height: 70,
    marginBottom: 10,
    width: 70,
  },
  mh8: { marginHorizontal: 8 },
  ml12: {
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: 12,
  },
  pressableText: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
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
  term: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  termContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 8,
    marginTop: 16,
  },
  title: {
    marginBottom: 4,
    textAlign: "center",
  },
})
