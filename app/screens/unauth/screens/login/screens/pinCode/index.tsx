import { Button, Header, Logo, Screen, Text } from "app/components/cores"
import { DividerText, PasscodeInput } from "app/components/utils"
import { useStores } from "app/models"
import { useHelper } from "app/services/hook"
import { observer } from "mobx-react-lite"
import { FC, useCallback, useEffect, useRef, useState } from "react"
import { StyleSheet } from "react-native"
import { LoginOptions, User2FAPincodeConfig } from "app/static/types"
import { LoginScreenProps } from "app/navigators"
import { useToast } from "app/services/utils"
import { useLoggedIn } from "../../../hook/useLoggedIn"
import { useAppTheme } from "@/utils/useAppTheme"
import { useAppLocale } from "@/i18n"
import { ResendOtp } from "./ResendOtp"

export const PinCodeLoginScreen: FC<LoginScreenProps<"loginByPincode">> = observer(
  ({ navigation, route: { params } }) => {
    const {
      theme: { colors },
    } = useAppTheme()
    const { setApiTokens, randomString } = useHelper()
    const { notifyApiError } = useToast()
    const { user } = useStores()
    const { translate, lang } = useAppLocale()

    const { email, code_otp, nonce: dlNonce, fromSignup } = params
    // ----------------------PARAMS--------------------
    const nonce = useRef(randomString(32))
    const [code, setCode] = useState("")
    const [isLoadding, setIsLoading] = useState(false)
    const [errorText, setErrorText] = useState("")

    // ----------------------COMPUTED--------------------
    const isEnable = code.length === 6

    // ----------------------METHOD--------------------
    const { onLoggedIn } = useLoggedIn()

    const navigateTo2FA = useCallback((credential: User2FAPincodeConfig) => {
      navigation.navigate("twoFA", {
        credential,
        type: "pincode",
      })
    }, [])

    const navigateToLoginWithPassword = useCallback(() => {
      navigation.navigate("login", {
        initMethod: LoginOptions.PASSWORD,
        email,
      })
    }, [email])

    const onGoBack = useCallback(() => {
      if (fromSignup) {
        navigation.goBack()
      } else {
        navigation.navigate("login", {
          initMethod: LoginOptions.PASSWORD,
          email,
        })
      }
    }, [fromSignup, navigation, email])

    const submitOTP = async () => {
      setIsLoading(true)
      const res = await user.registerByPinCode(code, nonce.current)
      if (res.kind === "ok") {
        if (res.data.is_factor2) {
          navigateTo2FA({
            nonce: nonce.current,
            code,
            methods: res.data.methods ?? [],
          })
        } else {
          if ("access_token" in res.data) {
            setApiTokens(res.data.access_token)
          }
          onLoggedIn(fromSignup)
          // setCode("")
        }
      } else {
        setErrorText(notifyApiError(res, true))
      }
      setIsLoading(false)
    }

    useEffect(() => {
      if (isEnable) {
        submitOTP()
      }
    }, [isEnable])

    useEffect(() => {
      if (!!code_otp) {
        setCode(code_otp)
      }
    }, [dlNonce, code_otp])

    return (
      <Screen
        preset="scroll"
        header={<Header leftIcon="arrow-left" onLeftPress={onGoBack} />}
        contentContainerStyle={styles.ph16}
      >
        <Logo preset={"cystack-logo"} style={styles.logo} />
        <Text weight="semiBold" size="xl" tx="new_signup:title" style={styles.title} />
        <Text preset="label" size="md" style={styles.label}>
          {translate("login_email_code:sub_title.prefix")}
          <Text color={colors.link} text={email} />
          {translate("login_email_code:sub_title.suffix")}
        </Text>

        <PasscodeInput
          iniCode={code_otp}
          isError={!!errorText}
          isLoading={isLoadding}
          onCodeFilled={setCode}
          onTextChange={() => {
            setErrorText("")
          }}
          style={styles.passcode}
        />
        <Text text={errorText} color={colors.error} style={styles.error} />

        <ResendOtp haveCode={!!code_otp} email={email} language={lang} nonce={nonce.current} />

        {!fromSignup && (
          <>
            <DividerText
              tx="login_email_code:or"
              color={colors.label}
              size="sm"
              containerStyle={styles.divider}
            />

            <Button
              disabled={isLoadding}
              onPress={navigateToLoginWithPassword}
              tx="login_email_code:sign_in"
            />
          </>
        )}
      </Screen>
    )
  }
)

const styles = StyleSheet.create({
  divider: {
    marginHorizontal: 8,
    marginVertical: 12,
  },
  error: {
    marginBottom: 4,
    textAlign: "center",
  },
  label: {
    alignSelf: "center",
    marginBottom: 4,
    maxWidth: "80%",
    textAlign: "center",
  },
  logo: {
    alignSelf: "center",
    height: 70,
    marginBottom: 10,
    width: 70,
  },
  passcode: {
    marginBottom: 8,
    marginVertical: 16,
  },
  ph16: {
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 4,
    textAlign: "center",
  },
})
