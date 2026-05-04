import { useRef, useState } from "react"
import { Dimensions, ScrollView } from "react-native"

import { MPEncodeConfig } from "@/static/types/user.types"

import { OtpPasswordlessGenerator, randomOtpNumber } from "./OtpGenerator"
import { PasswordlessQrScan } from "./PasswordlessQrScan"

const { width } = Dimensions.get("screen")

interface Props {
  lockConfig: MPEncodeConfig
  handleLogout: () => void
  handleUnlock: () => Promise<void>
}

export const OnPremiseLockByPasswordless = ({ lockConfig, handleLogout, handleUnlock }: Props) => {
  // ---------------------- PARAMS -------------------------

  const [otp, setOtp] = useState(randomOtpNumber())
  const [scanQrStep, setScanQrStep] = useState(0)

  const scrollViewRef = useRef<ScrollView>(null)
  // ------------------ METHODS ---------------------

  const scrollTo = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    })
    setScanQrStep(index)
  }

  return (
    <ScrollView
      horizontal
      pagingEnabled
      scrollEnabled={false}
      ref={scrollViewRef}
      showsHorizontalScrollIndicator={false}
      snapToInterval={width}
      decelerationRate="fast"
      scrollEventThrottle={16}
    >
      <OtpPasswordlessGenerator
        otp={otp}
        setOtp={setOtp}
        goNext={() => {
          scrollTo(1)
        }}
        goBack={handleLogout}
      />
      <PasswordlessQrScan
        lockConfig={lockConfig}
        otp={otp}
        goBack={() => {
          scrollTo(0)
        }}
        index={scanQrStep}
        handleUnlock={handleUnlock}
      />
    </ScrollView>
  )
}
