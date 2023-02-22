import React from "react"
import QRCodeScanner from "react-native-qrcode-scanner"
import {  View, Dimensions } from "react-native"

import { Header, Screen, Text } from "../../../components/cores"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"

export const PasswordlessQrScanScreen = observer(() => {
  const navigation = useNavigation()
  const { width, height } = Dimensions.get("screen")
  const onSuccess = (e) => {
    console.log(e)
  }

  return (
    <Screen
      safeAreaEdges={["top"]}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
          title="Scan QR code"
        />
      }
      contentContainerStyle={{
        flex: 1,
        alignItems: "center",
        padding: 20,
      }}
    >
      <View
        style={{
          width: width,
          height: width,
        }}
      >
        <QRCodeScanner onRead={onSuccess} />
      </View>
      <View
        style={{
          alignItems: "center",
          marginTop: 16
        }}
      >
        <Text preset="bold" text="One more step" style={{ marginBottom: 16 }} size="3xl" />
        <Text text="Point your camera to the QR Code on Desktop App to confirm Login" />
      </View>
    </Screen>
  )
})

