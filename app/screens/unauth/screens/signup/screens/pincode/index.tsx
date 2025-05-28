import { Header, Logo, Screen, Text } from "app/components/cores"
import { PasscodeInput } from "app/components/utils"
import { useStores } from "app/models"
import { idApi } from "app/services/api"
import { useAppLocale, useTheme } from "app/services/context"
import { useHelper } from "app/services/hook"
import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useRef, useState } from "react"
import { AppState, View } from "react-native"
import { SignUpScreenProps } from "../../route"

export const SignUpWithPinCode: FC<SignUpScreenProps<"signupPinCode">> = observer(
  ({
    navigation,
    route: {
      params: { email },
    },
  }) => {
    const { colors } = useTheme()
    const { setApiTokens, notify, randomString } = useHelper()
    const { user } = useStores()
    const { translate } = useAppLocale()
    const [code, setCode] = useState("")
    const [isLoadding, setIsLoading] = useState(false)
    const [errorText, setErrorText] = useState("")

    const nonce = useRef(randomString(32))

    const isEnable = code.trim().length === 6

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

    const onLoggedIn = async () => {
      const [userRes, userPwRes] = await Promise.all([user.getUser(), user.getUserPw()])
      if (userRes.kind === "ok" && userPwRes.kind === "ok") {
        if (user.is_pwd_manager) {
          navigation.navigate("lock")
        } else {
          navigation.navigate("createMasterPassword")
        }
      } else {
        notify("error", translate("error.something_went_wrong"))
      }
      setIsLoading(false)
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
          style={{ textAlign: "center", marginBottom: 4, maxWidth: "80%", alignSelf: "center" }}
        >
          {translate("login_email_code.sub_title.prefix")}
          <Text color={colors.link} text={email} />
          {translate("login_email_code.sub_title.suffix")}
        </Text>

        <PasscodeInput
          isLoading={isLoadding}
          onCodeFilled={setCode}
          style={{
            marginVertical: 16,
            marginBottom: 8,
          }}
        />
        <Text
          text={errorText}
          color={colors.error}
          style={{ textAlign: "center", marginBottom: 4 }}
        />

        <ResendOtp email={email} language={user.language} nonce={nonce.current} />
      </Screen>
    )
  },
)

interface Props {
  email: string
  language: string
  nonce: string
}
export const ResendOtp = ({ email, language, nonce }: Props) => {
  const { notifyApiError } = useHelper()
  const { translate } = useAppLocale()
  const { colors } = useTheme()
  const [timerCount, setTimer] = useState(60)
  const [enableResendBtn, setEnableResendBtn] = useState(true)
  const lastSend = useRef(0)
  const appState = useRef(AppState.currentState)

  const sendPinCode = async () => {
    setEnableResendBtn(false)
    lastSend.current = Date.now()
    setTimer(60)
    const res = await idApi.resendPinCode(email, language, nonce)
    if (res.kind !== "ok") {
      notifyApiError(res)
    }
  }

  useEffect(() => {
    if (!enableResendBtn) {
      const interval = setInterval(() => {
        setTimer((lastTimerCount) => {
          if (lastTimerCount === 0) {
            return 0
          } else {
            lastTimerCount <= 1 && clearInterval(interval)

            return lastTimerCount - 1
          }
        })
      }, 1000)
      return () => clearInterval(interval)
    }

    return undefined
  }, [enableResendBtn])

  useEffect(() => {
    if (timerCount === 0) {
      setEnableResendBtn(true)
    }
  }, [timerCount])

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        setTimer((lastTimerCount) => {
          if (lastTimerCount === 0) {
            return 0
          }
          return 60 - Math.min(60, Math.floor((Date.now() - lastSend.current) / 1000))
        })
      }
      appState.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [])

  useEffect(() => {
    sendPinCode()
  }, [])

  return (
    <View>
      <Text
        preset="label"
        style={{ textAlign: "center", marginBottom: 4, maxWidth: "80%", alignSelf: "center" }}
      >
        {translate("login_email_code.resend.prefix")}
        <Text
          disabled={!enableResendBtn}
          onPress={sendPinCode}
          color={enableResendBtn ? colors.link : colors.secondaryText}
          text={email}
          tx="login_email_code.resend.btn"
        />
        {!enableResendBtn && translate("login_email_code.resend.suffix", { second: timerCount })}
      </Text>
    </View>
  )
}
