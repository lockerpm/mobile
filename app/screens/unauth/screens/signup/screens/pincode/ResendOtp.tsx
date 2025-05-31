import { idApi } from "app/services/api"
import { useAppLocale, useTheme } from "app/services/context"
import { useToast } from "app/services/utils"
import React, { useEffect, useRef, useState } from "react"
import { AppState, View, StyleSheet } from "react-native"
import { Text } from "app/components/cores"

interface Props {
  email: string
  language: string
  nonce: string
}
export const ResendOtp = ({ email, language, nonce }: Props) => {
  const { notifyApiError } = useToast()
  const { translate } = useAppLocale()
  const { colors } = useTheme()

  // ------------------PARAMS---------------------
  const [timerCount, setTimer] = useState(60)
  const [enableResendBtn, setEnableResendBtn] = useState(true)
  const lastSend = useRef(0)
  const appState = useRef(AppState.currentState)

  // ------------------PARAMS---------------------
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
      <Text preset="label" style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    marginBottom: 4,
    maxWidth: "80%",
    textAlign: "center",
  },
})
