import React, { useState } from "react"
import { TextInput, View } from "react-native"
import { Text, Button } from "../../../../../components"
import { CountdownCircleTimer } from "react-native-countdown-circle-timer"
import { useMixins } from "../../../../../services/mixins"
import { getTOTP, parseOTPUri } from "../../../../../utils/totp"
import Icon from "react-native-vector-icons/FontAwesome"

type Prop = {
  data: string
  secure?: boolean
}

export const PasswordOtp = (props: Prop) => {
  const { data, secure } = props
  const { color } = useMixins()

  const otpData = parseOTPUri(data)

  const [otp, setOtp] = useState(getTOTP(otpData))

  const [hide, setHide] = useState(!!secure)
  // Calculate remaining time
  const getRemainingTime = (period: number) => {
    // Better late 1 sec than early
    return period + 1 - (Math.floor(new Date().getTime() / 1000) % period)
  }

  return (
    <View
      style={{
        backgroundColor: color.background,
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <View>
        {!!otpData.account && (
          <Text
            preset="semibold"
            text={otpData.account}
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ marginBottom: 4 }}
          />
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TextInput
            secureTextEntry={hide}
            value={otp}
            editable={false}
            style={{
              color: color.primary,
              marginRight: 8,
              fontSize: 20,
              minWidth: 80,
            }}
          />
          <CountdownCircleTimer
            onComplete={() => {
              // index === 0 && updateOtp()
              setOtp(getTOTP(otpData))
              return [true, 0]
            }}
            size={20}
            isPlaying
            duration={30}
            colors={color.primary}
            initialRemainingTime={getRemainingTime(otpData.period)}
            strokeWidth={4}
          />
        </View>
      </View>
      {secure && (
        <Button
          preset="link"
          onPress={() => {
            setHide(!hide)
          }}
        >
          <Icon name={!hide ? "eye-slash" : "eye"} size={20} color={color.text} />
        </Button>
      )}
    </View>
  )
}
