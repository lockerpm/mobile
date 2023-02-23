import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { View, Image, Platform, useWindowDimensions } from "react-native"
import { APP_ICON } from "../../../../../common/mappings"
import { ActionSheet } from "../../../../../components"
import { Button, Text } from "../../../../../components/cores"
import { useStores } from "../../../../../models"
import { verticalScale } from "../../../../../services/mixins/adaptive-layout"
import Animated, { scrollTo, useDerivedValue, useAnimatedRef } from "react-native-reanimated"

const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const indices = [0, 1, 2, 3, 5, 6]
const range = [0, 999999]

interface Props {
  otp: number
  setOtp: (val: number) => void
  goNext: () => void
  goBack: () => void
}

export const OtpPasswordlessGenerator = observer(({ otp, setOtp, goNext, goBack }: Props) => {
  const { uiStore } = useStores()

  const [otpInfo, setOtpInfo] = useState(false)
  const { width, height } = useWindowDimensions()
  const number = useDerivedValue(() => {
    const val = range[0] + Math.round(otp * (range[1] - range[0]))
    return val
  })

  return (
    <View style={{ flex: 1, width, height, padding: 20, paddingTop: 70 }}>
      <View
        style={{
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        <Image
          source={uiStore.isDark ? APP_ICON.textVerticalLight : APP_ICON.textVertical}
          style={{ height: verticalScale(80), width: verticalScale(90) }}
        />
      </View>

      <Text
        text={"Enter the OTP code displayed below to Desktop App to continue log in"}
        style={{ marginBottom: 16 }}
      />

      <View style={{ alignItems: "center" }}>
        <NumberDisplay number={number} />
      </View>

      <Button onPress={goNext} size="large" text="QR scan" style={{ marginBottom: 16 }} />
      <Button
        onPress={() => {
          setOtp(randomOtpNumber())
        }}
        size="large"
        text="Re gen Otp"
        style={{ marginBottom: 16 }}
      />

      <ActionSheet isOpen={otpInfo} onClose={() => setOtpInfo(false)}>
        <View style={{ width: "100%", paddingHorizontal: 20 }}>
          <Text
            preset="bold"
            text="Your Business Locker is set to log in with Passwordless Login method. To log in to your Vault, please follow the steps below: "
            style={{ marginBottom: 16 }}
          />

          <Text text={"1. Open your Vault on Locker Desktop App"} style={{ marginBottom: 16 }} />

          <Text
            text={"2. Click on    button on the top right > choose Passwordless Login on Phone"}
            style={{ marginBottom: 16 }}
          />
          <Text
            text={"3. Click on Continue button below to receive an OTP code "}
            style={{ marginBottom: 16 }}
          />
        </View>
      </ActionSheet>
    </View>
  )
})

export const randomOtpNumber = () => {
  return Math.round(Math.random() * 1000000)
}

function getDigit(number: Animated.SharedValue<number>, i: number) {
  return useDerivedValue(() => {
    return Math.floor(number.value / 10 ** i) % 10
  })
}

function NumberDisplay({ number }: { number: Animated.SharedValue<number> }) {
  return (
    <View style={{ height: 150, width: 200 }}>
      <View
        style={{
          flexDirection: "row-reverse",
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
}

function Digit({ digit }: { digit: Animated.SharedValue<number> }) {
  const aref = useAnimatedRef<Animated.ScrollView>()

  useDerivedValue(() => {
    if (Platform.OS === "web") {
      if (aref && aref.current) {
        aref.current.getNode().scrollTo({ y: digit.value * 200 })
      }
    } else {
      // TODO fix this
      scrollTo(aref, 0, digit.value * 200, true)
    }
  })

  return (
    <View style={{ height: 200, width: Platform.OS === "web" ? 50 : undefined }}>
      <Animated.ScrollView ref={aref}>
        {digits.map((i) => {
          return (
            <View
              style={{
                height: 200,
                alignItems: "center",
                flexDirection: "row",
              }}
              key={i}
            >
              <Text style={{ fontSize: 30 }}>{i}</Text>
            </View>
          )
        })}
      </Animated.ScrollView>
    </View>
  )
}
