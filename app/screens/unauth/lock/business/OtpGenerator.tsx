import React, { memo, useEffect, useState } from "react"
import { View, useWindowDimensions } from "react-native"
import { Button, Logo, Screen, Text } from "app/components/cores"
import { useTheme } from "app/services/context"
import { DetailInstructionModal } from "./DetailInstructionModal"
import { useHelper } from "app/services/hook"

const indices = [0, 1, 2, 3, 4, 5]

interface Props {
  otp: number
  setOtp: (val: number) => void
  goNext: () => void
  goBack: () => void
}

const OTP_EXPIRED_COUNTER = 60

export const OtpPasswordlessGenerator = ({ otp, setOtp, goNext, goBack }: Props) => {
  const { translate } = useHelper()

  const { colors, isDark } = useTheme()

  const [showInstruction, setShowInstruction] = useState(false)
  const [expireOtpCounter, setExpireOtpCounter] = useState(OTP_EXPIRED_COUNTER)
  const timerRef = React.useRef(expireOtpCounter)

  const { width } = useWindowDimensions()

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
      contentContainerStyle={{
        width,
        paddingHorizontal: 20,
        paddingTop: 50,
      }}
      footer={
        <View style={{ paddingHorizontal: 20 }}>
          <Button
            onPress={goNext}
            text={translate("common.continue")}
            style={{ marginBottom: 16 }}
          />

          <Button
            onPress={goBack}
            text={translate("onpremise_passwordless.instruction.go_back")}
            style={{ marginBottom: 16, backgroundColor: colors.block }}
            textStyle={{ color: colors.primaryText }}
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
        style={{ width: 132, height: 41, alignSelf: "center", marginBottom: 20 }}
        resizeMode="contain"
      />

      <Text style={{ marginBottom: 32 }}>
        {translate("onpremise_passwordless.title")}

        <Text
          color={colors.primary}
          onPress={() => {
            setShowInstruction(true)
          }}
        >
          {"   .." + translate("common.show_more").toLowerCase()}
        </Text>
      </Text>

      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <NumberDisplay number={otp} width={width} />
      </View>

      <Text
        text={translate("onpremise_passwordless.expired", { ss: expireOtpCounter })}
        style={{ color: colors.error, textAlign: "center" }}
      />

      <Button
        preset="teriatary"
        onPress={() => {
          reGenOtp()
        }}
        text={translate("onpremise_passwordless.new_otp")}
        style={{ marginBottom: 8 }}
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
    <View style={{ width, height: 50, paddingHorizontal: 20 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {indices.map((i) => {
          return <Digit digit={getDigit(number, i)} key={i} />
        })}
      </View>
    </View>
  )
})

function Digit({ digit }: { digit: number }) {
  const { colors } = useTheme()

  return (
    <View style={{ height: 50, width: 40, borderBottomWidth: 2, borderBottomColor: colors.border }}>
      <View
        style={{
          height: 50,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "600" }}>{digit}</Text>
      </View>
    </View>
  )
}
