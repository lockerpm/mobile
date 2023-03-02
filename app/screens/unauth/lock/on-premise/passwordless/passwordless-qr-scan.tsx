import React, { useEffect, useState } from "react"
import QRCodeScanner from "react-native-qrcode-scanner"
import { View, Dimensions } from "react-native"

import { Header, Text } from "../../../../../components/cores"
import { observer } from "mobx-react-lite"
import { useCipherAuthenticationMixins } from "../../../../../services/mixins/cipher/authentication"
import { useNavigation } from "@react-navigation/native"
import { SymmetricCryptoKey } from "../../../../../../core/models/domain"

interface Props {
  index: number
  otp: number
  goBack: () => void
  setSymmetricCryptoKey: (val: SymmetricCryptoKey) => void
  nextStep: (username: string, passwordHash: string, methods: { type: string; data: any }[]) => void
}

export const PasswordlessQrScan = observer(
  ({ otp, goBack, index, setSymmetricCryptoKey, nextStep }: Props) => {
    const { width, height } = Dimensions.get("screen")
    const navigation = useNavigation()
    const [onScanQR, setonScanQR] = useState(false)
    const { sessionQrLogin } = useCipherAuthenticationMixins()

    const onSuccess = async (e) => {
      const res = await sessionQrLogin(
        e.data,
        otp.toString(),
        true,
        setSymmetricCryptoKey,
        nextStep,
      )

      if (res.kind === "ok") {
        navigation.navigate("mainStack", { screen: "start" })
      } else if (res.kind === "unauthorized") {
        navigation.navigate("login", { type: "onPremise" })
      }
    }

    useEffect(() => {
      setonScanQR(index === 1)
    }, [index])

    return (
      <View style={{ flex: 1, width, height }}>
        <Header leftIcon="arrow-left" onLeftPress={goBack} title="Scan QR code" />
        <View
          style={{
            paddingTop: 70,
            width: width,
            height: width,
          }}
        >
          {onScanQR && <QRCodeScanner onRead={onSuccess} />}
        </View>
        <View
          style={{
            alignItems: "center",
            marginTop: 86,
            padding: 20,
          }}
        >
          <Text preset="bold" text="One more step" style={{ marginBottom: 16 }} size="3xl" />
          <Text text="Point your camera to the QR Code on Desktop App to confirm Login" />
        </View>
      </View>
    )
  },
)
