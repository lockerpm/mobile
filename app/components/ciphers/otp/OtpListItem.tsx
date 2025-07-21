import { memo, useState } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import { CountdownCircleTimer } from "react-native-countdown-circle-timer"
import { PressableScale, Text } from "app/components/cores"
import { getTOTP, parseOTPUri } from "app/utils/totp"
import { useAppTheme } from "@/utils/useAppTheme"
import { CipherAppView } from "@/static/types"
import { ThemedStyle } from "@/theme"

type Prop = {
  seletedOtp?: string
  item: CipherAppView
  openActionMenu: (val: any) => void
}
// Calculate remaining time
const getRemainingTime = (period: number) => {
  // Better late 1 sec than early
  return period + 1 - (Math.floor(new Date().getTime() / 1000) % period)
}

export const OtpListItem = memo((props: Prop) => {
  const { item, openActionMenu, seletedOtp } = props
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const otpData = parseOTPUri(item.notes)

  const [key, setKey] = useState(0)
  const [initTime, setInitTime] = useState(getRemainingTime(otpData.period || 0))
  const [otp, setOtp] = useState(getTOTP(otpData))

  return (
    <PressableScale
      onPress={() => {
        openActionMenu(item)
      }}
      style={[
        themed($container),
        {
          borderColor: seletedOtp === item.notes ? colors.primary : colors.border,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.text}>
            <Text preset="bold" text={item.name} numberOfLines={2} ellipsizeMode="tail" />
            <Text text={otp} color={colors.primary} size="md" />
          </View>
        </View>

        <CountdownCircleTimer
          key={key}
          onComplete={() => {
            return {
              shouldRepeat: true,
            }
          }}
          onUpdate={(remainingTime: number) => {
            if (remainingTime < 5) {
              const newOtp = getTOTP(otpData)

              if (otp !== newOtp) {
                setOtp(getTOTP(otpData))
                setInitTime(getRemainingTime(otpData.period || 0))
                setKey((prev) => prev + 1)
              }
            }
          }}
          updateInterval={1}
          size={25}
          isPlaying
          duration={30}
          colors={colors.primary}
          initialRemainingTime={initTime}
          strokeWidth={4}
        />
      </View>
    </PressableScale>
  )
})

OtpListItem.displayName = "OtpListItem"

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
})

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
  },
  mh8: {
    marginHorizontal: 8,
  },
  ml10: {
    marginLeft: 10,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
  },
  text: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 8,
  },
})
