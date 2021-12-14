import React, { useState } from "react"
import { View } from "react-native"
import { useNavigation } from "@react-navigation/core"
import { Header, Layout } from "../../../../../components"
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useMixins } from "../../../../../services/mixins"
import { CipherType } from "../../../../../../core/enums"
import { parseOTPUri, getTOTP, beautifyName } from "../../../../../utils/totp"


export const QRScannerScreen = function QRScannerScreen() {
  const navigation = useNavigation()
  const { newCipher, createCipher, translate, notify, color } = useMixins()
  
  const [isLoading, setIsLoading] = useState(false)

  const onSuccess = async (e) => {
    const payload = parseOTPUri(e.data)
    try {
      const otp = getTOTP(payload)
      if (otp) {
        await handleSave(payload.account, e.data)
      } else {
        notify('error', translate('authenticator.invalid_qr'))
      }
    } catch (e) {
      notify('error', translate('authenticator.invalid_qr'))
    }
    navigation.goBack()
  }

  const handleSave = async (name: string, note: string) => {
    setIsLoading(true)
    const payload = newCipher(CipherType.TOTP)
    payload.name = beautifyName(name)
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
          title={translate('authenticator.scan_a_qr')}
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
}
