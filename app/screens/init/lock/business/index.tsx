import { useCallback, useRef, useState } from "react"
import { Dimensions, ScrollView } from "react-native"
import { BusinessPasswordlessQrScan } from "./PasswordlessQrScan"
import { OtpPasswordlessGenerator, randomOtpNumber } from "../onPremise/passwordless/OtpGenerator"

const { width } = Dimensions.get("screen")

interface Props {
  handleLogout: () => void
  handleUnlock: () => Promise<void>
}

export const BusinessLockByPasswordless = ({ handleLogout, handleUnlock }: Props) => {
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

  const Otp = useCallback(
    () => (
      <OtpPasswordlessGenerator
        otp={otp}
        setOtp={setOtp}
        goNext={() => {
          scrollTo(1)
        }}
        goBack={handleLogout}
      />
    ),
    [otp]
  )

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
      <Otp />
      <BusinessPasswordlessQrScan
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
