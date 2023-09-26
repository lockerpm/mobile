import React, { useState } from 'react'
import { TextInput, View } from 'react-native'
import { Text, Icon } from 'app/components-v2/cores'
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { getTOTP, parseOTPUri } from 'app/utils/totp'

type Prop = {
  data: string
  secure?: boolean
}

export const PasswordOtp = (props: Prop) => {
  const { data, secure } = props
  const { colors } = useTheme()
  const { copyToClipboard } = useHelper()

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
        backgroundColor: colors.background,
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <View>
        {!!otpData.account && !secure && (
          <Text
            preset="bold"
            text={otpData.account}
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ marginBottom: 4 }}
          />
        )}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TextInput
            secureTextEntry={hide}
            value={otp}
            editable={false}
            style={{
              color: colors.primary,
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
            colors={colors.primary}
            initialRemainingTime={getRemainingTime(otpData.period)}
            strokeWidth={4}
          />
        </View>
      </View>
      {secure && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 10,
          }}
        >
          <Icon
            icon={!hide ? 'eye-slash' : 'eye'}
            size={18}
            color={colors.title}
            onPress={() => {
              setHide(!hide)
            }}
          />

          <Icon
            icon={'copy'}
            size={18}
            color={colors.title}
            onPress={() => {
              copyToClipboard(getTOTP(otpData))
            }}
          />
        </View>
      )}
    </View>
  )
}
