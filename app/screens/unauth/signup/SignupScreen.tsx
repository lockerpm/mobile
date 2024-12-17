import React, { useState, useEffect, useRef, FC } from "react"
import { BackHandler, Linking, Platform, TouchableOpacity, View } from "react-native"
import { useStores } from "app/models"
import { useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"
import { Checkbox } from "react-native-ui-lib"
import { Screen, Text, Button, TextInput, Logo, Header } from "app/components/cores"
import {
  SocialLogin,
  RecaptchaChecker,
  IosPasswordlessOptions,
  DividerText,
  SetLanguage,
} from "app/components/utils"
import { Passkey, PasskeyRegistrationResult } from "react-native-passkey"
import { PasskeyRegistrationRequest } from "react-native-passkey/lib/typescript/Passkey"
import { credentialCreationOptions, publicKeyCredentialWithAttestation } from "app/utils/passkey"
import { IS_IOS, PRIVACY_POLICY_URL, REGISTER_BUSINESS_URL, TERMS_URL } from "app/config/constants"
import { getCookies, logRegisterSuccessEvent } from "app/utils/analytics"
import { Logger, validateEmail } from "app/utils/utils"
import { observer } from "mobx-react-lite"
import { RootStackScreenProps } from "app/navigators/navigators.types"

export const SignupScreen: FC<RootStackScreenProps<"signup">> = observer(({ navigation }) => {
  const { colors } = useTheme()
  const { user } = useStores()
  const { notify, notifyApiError, translate } = useHelper()

  // ---------------- PARAMS ---------------------

  const captchaRef = useRef(null)

  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [getNews, setGesNews] = useState(false)

  const [isPasskeySupported, setIsPasskeySupported] = useState(true)

  const [isShowCreatePasskeyOptions, setIsShowCreatePasskeyOptions] = useState(false)
  const [isIcloudSelected, setIsIcloudSelected] = useState(true)

  // ---------------- COMPUTED ---------------------
  const fullname = email.replace(/[^a-zA-Z ]/g, "")
  const isEmail = validateEmail(email)

  // ---------------- METHODS ---------------------

  const navigateLogin = () => {
    navigation.replace("login")
  }

  const handleRegisterWebauth = async (
    email: string,
    fullname: string,
    withSecurityKey?: boolean,
  ) => {
    const resPassKeyOptions = await user.registerPasskeyOptions({
      email,
      full_name: fullname,
      algorithms: ["es256", "rs256"],
    })
    if (resPassKeyOptions.kind === "ok") {
      try {
        const requestJson: PasskeyRegistrationRequest = credentialCreationOptions(
          resPassKeyOptions.data,
        )

        // @ts-ignore
        const result: PasskeyRegistrationResult = await Passkey.register(requestJson, {
          withSecurityKey,
        })

        const res = await user.registerPasskey({
          email,
          password: "",
          country: "vi",
          confirm_password: "",
          full_name: fullname,
          request_code: "",
          scope: "pwdmanager",
          utm_source: await getCookies("utm_source"),
          response: publicKeyCredentialWithAttestation(result),
        })
        setIsLoading(false)
        if (res.kind === "ok") {
          logRegisterSuccessEvent()
          notify("success", translate("signup.signup_successful"), 5000)
          navigation.replace("login")
        } else {
          notifyApiError(res)
          onRegisterWithPinCode()
        }
      } catch (error) {
        onRegisterWithPinCode()

        // Handle Error...
        notify("error", translate("passkey.error.user_cancel"), 5000)
      }
    } else {
      notifyApiError(resPassKeyOptions)
      onRegisterWithPinCode()
    }
  }

  const onRegisterWebauth = async () => {
    if (isIcloudSelected) {
      handleRegisterWebauth(email, fullname)
    } else {
      handleRegisterWebauth(email, fullname, true)
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
  const checkPasskeySupported = async () => {
    const res = await Passkey.isSupported()
    if (!res) {
      setIsPasskeySupported(false)
    }
  }

  const onRegisterWithPinCode = () => {
    navigation.navigate("signup_pin_code", {
      email,
      getNews,
    })
  }

  const onRegister = () => {
    if (isPasskeySupported) {
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
    checkPasskeySupported()
  }, [])

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
      preset="scroll"
      safeAreaEdges={["bottom"]}
      header={<Header RightActionComponent={<SetLanguage />} />}
      keyboardOffset={0}
    >
      <RecaptchaChecker ref={captchaRef} />

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
          action={async () => {
            setIsShowCreatePasskeyOptions(false)
            await onRegisterWebauth()
          }}
        />
      )}

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

        <SocialLogin
          isSingIn={false}
          onLoggedIn={onLoggedIn}
          setIsLoading={setIsLoading}
          style={{
            marginTop: 32,
            marginBottom: 24,
          }}
        />

        <DividerText
          tx="new_signup.other_signup"
          style={{ marginHorizontal: 8 }}
          color={colors.secondaryText}
          size="base"
        />

        <TextInput
          isRequired
          animated
          label={translate("common.email")}
          value={email}
          onChangeText={setEmail}
        />

        <TermAndConditions agreed={getNews} setAgreed={setGesNews} />

        <Text size="base">
          {translate("signup.agree_with") + " "}
          <Text
            size="base"
            color={colors.primary}
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
            color={colors.primary}
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
          disabled={isLoading || !isEmail}
          text={translate("new_signup.sign_up_email")}
          onPress={onRegister}
          style={{
            width: "100%",
            marginTop: 24,
            marginBottom: 20,
          }}
        />

        <Text size="base" preset="label" style={{ textAlign: "center", marginVertical: 12 }}>
          {translate("new_signup.sign_up_business.title")}
          <Text
            weight="medium"
            size="base"
            style={{ color: colors.primary }}
            onPress={() => {
              Linking.canOpenURL(REGISTER_BUSINESS_URL)
                .then((val) => {
                  if (val) Linking.openURL(REGISTER_BUSINESS_URL)
                })
                .catch((e) => Logger.error(e))
            }}
            tx="new_signup.sign_up_business.free_trial"
          />
        </Text>

        <Text size="base" preset="label" style={{ textAlign: "center" }}>
          {translate("new_signup.has_account")}
          <Text
            size="base"
            weight="medium"
            onPress={navigateLogin}
            style={{ color: colors.primary }}
            tx="new_signup.sign_in"
          />
        </Text>
      </View>
    </Screen>
  )
})

const TermAndConditions = ({
  agreed,
  setAgreed,
}: {
  agreed: boolean
  setAgreed: (val: boolean) => void
}) => {
  const { colors } = useTheme()
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginTop: 10,
        marginBottom: 8,
      }}
    >
      <Checkbox
        borderRadius={4}
        value={agreed}
        color={colors.primary}
        onValueChange={setAgreed}
        style={{
          marginVertical: 7,
          marginRight: 8,
          borderColor: colors.secondaryText,
          borderRadius: 4,
        }}
        size={18}
      />
      <TouchableOpacity onPress={() => setAgreed(!agreed)}>
        <Text tx={"new_signup.marketing"} size="base" />
      </TouchableOpacity>
    </View>
  )
}
