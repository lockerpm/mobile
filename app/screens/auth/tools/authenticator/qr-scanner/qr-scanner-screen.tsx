import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { useNavigation } from "@react-navigation/core"
import { Header, Layout } from "../../../../../components"
import { color } from "../../../../../theme"
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useMixins } from "../../../../../services/mixins"
import { CipherType } from "../../../../../../core/enums"


export const QRScannerScreen = observer(function QRScannerScreen() {
  const navigation = useNavigation()
  const { newCipher, createCipher, parseOTPUri } = useMixins()

  const [isLoading, setIsLoading] = useState(false)

  const onSuccess = async (e) => {
    const payload = parseOTPUri(e.data)
    await handleSave(payload.account, e.data)
    navigation.goBack()
  }

  const handleSave = async (name: string, note: string) => {
    setIsLoading(true)
    const payload = newCipher(CipherType.TOTP)
    payload.name = name
    payload.notes = note

    const res = await createCipher(payload, 0, [])

    setIsLoading(false)
    return res
  }

  // -------------------- RENDER ----------------------

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0
      }}
      header={(
        <Header
          title="QR Code"
          goBack={() => navigation.goBack()}
          right={(
            <View style={{ width: 10 }} />
          )}
        />
      )}
    >
      <QRCodeScanner
        onRead={onSuccess}
      />
    </Layout>
  )
})
