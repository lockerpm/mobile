import React, { useEffect, useState } from "react"
import QRCodeScanner from "react-native-qrcode-scanner"
import { View, Dimensions } from "react-native"

import { Text } from "../../../../../components/cores"
import { observer } from "mobx-react-lite"

interface Props {
  index: number
  otp: number
  setOtp: (val: number) => void
  goBack: () => void
}

export const PasswordlessQrScan = observer(({ otp, setOtp, goBack, index }: Props) => {
  const { width, height } = Dimensions.get("screen")

  const [onScanQR, setonScanQR] = useState(false)

  const onSuccess = (e) => {
    console.log(e)
  }
  useEffect(() => {
    setonScanQR(index === 1)
  }, [index])

  return (
    <View style={{ flex: 1, width, height,paddingTop: 70 }}>
      <View
        style={{
          width: width,
          height: width,
        }}
      >
        {onScanQR && <QRCodeScanner onRead={onSuccess} />}
      </View>
      <View
        style={{
          alignItems: "center",
          marginTop: 16,
          padding: 20, 
        }}
      >
        <Text preset="bold" text="One more step" style={{ marginBottom: 16 }} size="3xl" />
        <Text text="Point your camera to the QR Code on Desktop App to confirm Login" />
      </View>
    </View>
  )
})
