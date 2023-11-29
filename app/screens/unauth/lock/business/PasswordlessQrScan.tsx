import React, { useEffect, useState } from "react"
import QRCodeScanner from "react-native-qrcode-scanner"
import { View, Dimensions } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useAuthentication, useHelper } from "app/services/hook"
import { Header, Text } from "app/components/cores"
import { useStores } from "app/models"

interface Props {
  index: number
  otp: number
  goBack: () => void
}

export const BusinessPasswordlessQrScan = ({ otp, goBack, index }: Props) => {
  const { uiStore } = useStores()
  const { translate } = useHelper()
  const { width, height } = Dimensions.get("screen")
  const navigation = useNavigation() as any
  const [onScanQR, setonScanQR] = useState(false)
  const { sessionBusinessQrLogin } = useAuthentication()

  const onSuccess = async (e) => {
    const res = await sessionBusinessQrLogin(e.data, otp.toString())

    if (res.kind === "ok") {
      uiStore.setStartFromPasswordLess(true)
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
      <Header
        leftIcon="arrow-left"
        onLeftPress={goBack}
        title={translate("onpremise_passwordless.qr_scan")}
      />
      <View
        style={{
          paddingTop: 70,
          width,
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
        <Text
          preset="bold"
          text={translate("onpremise_passwordless.more_step")}
          style={{ marginBottom: 16 }}
          size="xl"
        />
        <Text text={translate("onpremise_passwordless.point_camera")} />
      </View>
    </View>
  )
}
