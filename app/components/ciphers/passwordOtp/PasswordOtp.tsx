/* eslint-disable no-restricted-imports */
import { useCallback, useEffect, useState } from "react"
import { View, TextInput, StyleSheet, ViewStyle } from "react-native"
import { CountdownCircleTimer } from "react-native-countdown-circle-timer"

import { Text, PressableIcon } from "app/components/cores"
import { useClipboard } from "app/services/utils"
import { getTOTP, parseOTPUri } from "app/utils/totp"

import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

type Prop = {
  data: string
  hideName?: boolean
  secure?: boolean
  containerStyle?: ViewStyle
}

export const PasswordOtp = (props: Prop) => {
  const { data, secure, hideName, containerStyle } = props
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { copyToClipboard } = useClipboard()

  const otpData = parseOTPUri(data)

  const [hide, setHide] = useState(!!secure)

  const [otp, setOtp] = useState("000000")

  const getOtp = useCallback(async () => {
    const res = await getTOTP(otpData)
    setOtp(res)
  }, [otpData])

  // Calculate remaining time
  const getRemainingTime = (period: number) => {
    // Better late 1 sec than early
    return period + 1 - (Math.floor(new Date().getTime() / 1000) % period)
  }

  useEffect(() => {
    getOtp()
  }, [getOtp])

  return (
    <View style={[themed($container), containerStyle]}>
      <View>
        {!!otpData.account && !secure && !hideName && (
          <Text
            preset="bold"
            text={otpData.account}
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.mb4}
          />
        )}

        <View style={styles.row}>
          <TextInput
            secureTextEntry={hide}
            value={otp}
            editable={false}
            style={[
              {
                color: colors.primary,
              },
              styles.otp,
            ]}
          />
          <CountdownCircleTimer
            onComplete={() => {
              getTOTP(otpData).then((newOtp) => {
                setOtp(newOtp)
              })
              return {
                shouldRepeat: true,
              }
            }}
            size={20}
            isPlaying
            duration={30}
            colors={colors.primary}
            initialRemainingTime={getRemainingTime(otpData.period ?? 30)}
            strokeWidth={4}
          />
        </View>
      </View>
      {secure && (
        <View style={styles.eyeContainer}>
          <PressableIcon
            icon={!hide ? "eye-slash" : "eye"}
            size={20}
            color={colors.title}
            onPress={() => {
              setHide(!hide)
            }}
            containerStyle={styles.eye}
          />

          <PressableIcon
            icon={"copy"}
            size={20}
            color={colors.title}
            onPress={() => {
              getTOTP(otpData).then((newOtp) => {
                copyToClipboard(newOtp)
              })
            }}
          />
        </View>
      )}
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  flexDirection: "row",
  justifyContent: "space-between",
})

const styles = StyleSheet.create({
  eye: {
    marginRight: 16,
  },
  eyeContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginRight: 10,
  },
  mb4: {
    marginBottom: 4,
  },
  otp: {
    fontSize: 20,
    marginRight: 8,
    minWidth: 80,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
