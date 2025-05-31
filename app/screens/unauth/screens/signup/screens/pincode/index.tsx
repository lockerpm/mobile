import { Header, Logo, Screen, Text } from "app/components/cores"
import { PasscodeInput } from "app/components/utils"
import { useStores } from "app/models"
import { SignUpScreenProps } from "app/navigators"
import { useAppLocale, useTheme } from "app/services/context"
import { useHelper } from "app/services/hook"
import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useRef, useState } from "react"
import { ResendOtp } from "./ResendOtp"
import { StyleSheet } from "react-native"
import { useLoggedIn } from "../../../hook/useLoggedIn"

export const SignUpWithPinCode: FC<SignUpScreenProps<"signupPinCode">> = observer(
  ({
    navigation,
    route: {
      params: { email },
    },
  }) => {
    const { colors } = useTheme()
    const { setApiTokens, randomString } = useHelper()
    const { user } = useStores()
    const { translate } = useAppLocale()

    // ---------------- PARAMS ---------------------
    const [code, setCode] = useState("")
    const [isLoadding, setIsLoading] = useState(false)
    const [errorText, setErrorText] = useState("")

    // ---------------- COMPUTED ---------------------
    const nonce = useRef(randomString(32))
    const isEnable = code.trim().length === 6

    // ---------------- METHODS ---------------------
    const { onLoggedIn } = useLoggedIn()

    const submitOTP = async () => {
      if (isEnable) {
        setIsLoading(true)
        const res = await user.registerByPinCode(code, nonce.current)
        if (res.kind === "ok") {
          if ("access_token" in res.data) {
            setApiTokens(res.data.access_token)
          }
          onLoggedIn()
        } else {
          setErrorText(translate("new_signup.error_pin"))
        }
        setCode("")
        setIsLoading(false)
      }
    }

    useEffect(() => {
      submitOTP()
    }, [isEnable])

    return (
      <Screen
        padding
        safeAreaEdges={["bottom"]}
        header={<Header leftIcon="arrow-left" onLeftPress={navigation.goBack} />}
      >
        <Logo preset={"cystack-logo"} style={styles.logo} />
        <Text weight="semibold" size="xl" tx="new_signup.title" style={styles.title} />
        <Text preset="label" size="medium" style={styles.label}>
          {translate("login_email_code.sub_title.prefix")}
          <Text color={colors.link} text={email} />
          {translate("login_email_code.sub_title.suffix")}
        </Text>

        <PasscodeInput isLoading={isLoadding} onCodeFilled={setCode} style={styles.inputPasscode} />
        <Text text={errorText} color={colors.error} style={styles.error} />

        <ResendOtp email={email} language={user.language} nonce={nonce.current} />
      </Screen>
    )
  },
)

const styles = StyleSheet.create({
  error: {
    marginBottom: 4,
    textAlign: "center",
  },
  inputPasscode: {
    marginBottom: 8,
    marginVertical: 16,
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
  title: {
    marginBottom: 4,
    textAlign: "center",
  },
})
