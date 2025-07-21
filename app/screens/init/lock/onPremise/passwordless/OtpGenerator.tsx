import { memo, useEffect, useRef, useState } from "react"
import { Dimensions, StyleSheet, View, ViewStyle } from "react-native"
import { Button, Logo, Screen, Text } from "app/components/cores"
import { DetailInstructionModal } from "./DetailInstructionModal"
import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"

const indices = [0, 1, 2, 3, 4, 5]

interface Props {
  otp: number
  setOtp: (val: number) => void
  goNext: () => void
  goBack: () => void
}

const OTP_EXPIRED_COUNTER = 60

const { width } = Dimensions.get("screen")

export const OtpPasswordlessGenerator = ({ otp, setOtp, goNext, goBack }: Props) => {
  const { translate } = useAppLocale()

  const {
    themed,
    theme: { colors },
    themeContext,
  } = useAppTheme()
  const isDark = themeContext === "dark"
  const [showInstruction, setShowInstruction] = useState(false)
  const [expireOtpCounter, setExpireOtpCounter] = useState(OTP_EXPIRED_COUNTER)
  const timerRef = useRef(expireOtpCounter)

  const reGenOtp = () => {
    setOtp(randomOtpNumber())
    setExpireOtpCounter(OTP_EXPIRED_COUNTER)
    timerRef.current = OTP_EXPIRED_COUNTER
  }

  const counter = () => {
    if (timerRef.current === 0) {
      reGenOtp()
    }
    timerRef.current -= 1
    setExpireOtpCounter(timerRef.current)
  }

  useEffect(() => {
    const timerId = setInterval(() => {
      counter()
    }, 1000)
    return () => {
      clearInterval(timerId)
    }
  }, [])

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={styles.content}
      footer={
        <View style={styles.ph16}>
          <Button onPress={goNext} tx={"common:continue"} style={styles.mb16} />

          <Button
            onPress={goBack}
            tx={"onpremise_passwordless:instruction.go_back"}
            style={themed($go_back)}
            textStyle={{ color: colors.text }}
          />
        </View>
      }
    >
      <DetailInstructionModal
        isOpen={showInstruction}
        onClose={() => {
          setShowInstruction(false)
        }}
      />
      <Logo
        preset={isDark ? "horizontal-light" : "horizontal-dark"}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.mb32}>
        {translate("onpremise_passwordless:title")}

        <Text
          color={colors.primary}
          onPress={() => {
            setShowInstruction(true)
          }}
        >
          {"   .." + translate("common:show_more").toLowerCase()}
        </Text>
      </Text>

      <View style={styles.numberDisplay}>
        <NumberDisplay number={otp} width={width} />
      </View>

      <Text
        tx="onpremise_passwordless:expired"
        txOptions={{ ss: expireOtpCounter }}
        color={colors.error}
        style={styles.centerText}
      />

      <Button
        preset="teriatary"
        onPress={reGenOtp}
        tx={"onpremise_passwordless:new_otp"}
        style={styles.new_otp}
      />
    </Screen>
  )
}

export const randomOtpNumber = () => {
  return Math.round(Math.random() * 1000000)
}

function getDigit(number: number, i: number) {
  return parseInt(number.toString().charAt(i)) || 0
}

const NumberDisplay = memo(({ number, width }: { number: number; width: number }) => {
  return (
    <View style={[{ width }, styles.digitContainer]}>
      <View style={styles.digitList}>
        {indices.map((i) => {
          return <Digit digit={getDigit(number, i)} key={i} />
        })}
      </View>
    </View>
  )
})
NumberDisplay.displayName = "NumberDisplay"

function Digit({ digit }: { digit: number }) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($digit)}>
      <View style={styles.digit}>
        <Text weight="semiBold" size="xl">
          {digit}
        </Text>
      </View>
    </View>
  )
}

const $digit: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 50,
  width: 40,
  borderBottomWidth: 2,
  borderBottomColor: colors.border,
})
const $go_back: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginBottom: 16,
  backgroundColor: colors.block,
})

const styles = StyleSheet.create({
  centerText: {
    textAlign: "center",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 50,
    width,
  },
  digit: {
    alignItems: "center",
    flexDirection: "row",
    height: 50,
    justifyContent: "center",
  },
  digitContainer: {
    height: 50,
    paddingHorizontal: 20,
  },
  digitList: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logo: {
    alignSelf: "center",
    height: 41,
    marginBottom: 20,
    width: 132,
  },
  mb16: {
    marginBottom: 16,
  },
  mb32: {
    marginBottom: 32,
  },
  new_otp: {
    marginBottom: 8,
  },
  numberDisplay: {
    alignItems: "center",
    marginBottom: 16,
  },
  ph16: {
    paddingHorizontal: 16,
  },
})
