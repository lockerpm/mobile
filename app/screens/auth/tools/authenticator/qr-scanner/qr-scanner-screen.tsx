import React, { useState } from "react"
import { View } from "react-native"
import { useNavigation } from "@react-navigation/core"
import { Header, Layout } from "../../../../../components"
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useMixins } from "../../../../../services/mixins"
import { CipherType } from "../../../../../../core/enums"
import { parseOTPUri, getTOTP, beautifyName, decodeGoogleAuthenticatorImport } from "../../../../../utils/totp"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers";
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data";
import { Logger } from "../../../../../utils/logger";


export const QRScannerScreen = function QRScannerScreen() {
  const navigation = useNavigation()
  const { translate, notify, color } = useMixins()
  const { newCipher } = useCipherHelpersMixins()
  const { createCipher, importCiphers } = useCipherDataMixins()
  
  const [isLoading, setIsLoading] = useState(false)

  const onSuccess = async (e) => {
    if (e.data.startsWith('otpauth-migration://')) {
      handleGoogleAuthenticatorImport(e.data)
    } else {
      handleSaveQr(e.data)
    }
  }

  const handleSaveQr = async (uri: string) => {
    const payload = parseOTPUri(uri)
    try {
      const otp = getTOTP(payload)
      if (otp) {
        setIsLoading(true)
        const cipher = newCipher(CipherType.TOTP)
        cipher.name = beautifyName(payload.account)
        cipher.notes = uri
        await createCipher(cipher, 0, [])
        setIsLoading(false)
      } else {
        notify('error', translate('authenticator.invalid_qr'))
      }
    } catch (e) {
      notify('error', translate('authenticator.invalid_qr'))
    }
    navigation.goBack()
  }

  const handleGoogleAuthenticatorImport = async (uri: string) => {
    try {
      setIsLoading(true)
      const otps = decodeGoogleAuthenticatorImport(uri)
      const ciphers = otps.map((otp) => {
        const payload = newCipher(CipherType.TOTP)
        payload.name = beautifyName(otp.account)
        payload.notes = `otpauth://totp/${encodeURIComponent(otp.account)}`
          + `?secret=${otp.secret}` 
          + `&issuer=${encodeURIComponent(otp.account)}`
          + `&algorithm=${otp.algorithm.toLowerCase().split('-').join('')}`
          + `&digits=${otp.digits}&period=${otp.period}`
        return payload
      })

      if (!ciphers.length) {
        notify('error', translate('authenticator.invalid_qr'))
        return
      }

      await importCiphers({
        ciphers,
        folders: [],
        folderRelationships: []
      } as any)
    } catch (e) {
      Logger.error('Import google qr: ' + e)
      notify('error', translate('authenticator.invalid_qr'))
    }
    setIsLoading(false)
    navigation.goBack()
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
            <View style={{ width: 30 }} />
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
