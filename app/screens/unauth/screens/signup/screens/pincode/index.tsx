import { FC, useCallback, useRef, useState } from "react"
import { StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"

import { Header, Logo, Screen, Text } from "app/components/cores"
import { PasscodeInput } from "app/components/utils"
import { useStores } from "app/models"
import { SignUpScreenProps } from "app/navigators"
import { useHelper } from "app/services/hook"

import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"

import { useLoggedIn } from "../../../hook/useLoggedIn"
import { ResendOtp } from "../../../login/screens/pinCode/ResendOtp"

export const SignUpWithPinCode: FC<SignUpScreenProps<"signupPinCode">> = observer(
  ({
    navigation,
    route: {
      params: { email },
    },
  }) => {
    const { theme } = useAppTheme()
    const { setApiTokens, randomString } = useHelper()
    const { user } = useStores()
    const { translate, lang } = useAppLocale()

    // ---------------- PARAMS ---------------------
    const [isLoadding, setIsLoading] = useState(false)
    const [errorText, setErrorText] = useState("")

    // ---------------- COMPUTED ---------------------
    const nonce = useRef(randomString(32))

    // ---------------- METHODS ---------------------
    const { onLoggedIn } = useLoggedIn()

    const submitOTP = useCallback(
      async (code: string) => {
        setIsLoading(true)
        const res = await user.registerByPinCode(code, nonce.current)
        if (res.kind === "ok") {
          if ("access_token" in res.data) {
            setApiTokens(res.data.access_token)
          }
          await onLoggedIn(true)
        } else {
          setErrorText(translate("new_signup:error_pin"))
        }
        setIsLoading(false)
      },
      [nonce, onLoggedIn, setApiTokens, user, translate]
    )

    return (
      <Screen
        safeAreaEdges={["bottom"]}
        header={<Header leftIcon="arrow-left" onLeftPress={navigation.goBack} />}
        contentContainerStyle={styles.ph16}
      >
        <Logo preset={"cystack-logo"} style={styles.logo} />
        <Text weight="semiBold" size="xl" tx="new_signup:title" style={styles.title} />
        <Text preset="label" size="md" style={styles.label}>
          {translate("login_email_code:sub_title.prefix")}
          <Text color={theme.colors.link} text={email} />
          {translate("login_email_code:sub_title.suffix")}
        </Text>

        <PasscodeInput
          isLoading={isLoadding}
          onCodeFilled={submitOTP}
          style={styles.inputPasscode}
        />
        <Text text={errorText} color={theme.colors.error} style={styles.error} />

        <ResendOtp email={email} language={lang} nonce={nonce.current} />
      </Screen>
    )
  }
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
  ph16: {
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 4,
    textAlign: "center",
  },
})
