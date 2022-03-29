import React, { useState } from "react"
import { View } from "react-native"
import { useNavigation } from "@react-navigation/core"
import { Header, Layout } from "../../../../../components"
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useMixins } from "../../../../../services/mixins"
import { CipherType } from "../../../../../../core/enums"
import { decodeGoogleAuthenticatorImport, beautifyName } from "../../../../../utils/totp"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers";
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data";
import { Logger } from "../../../../../utils/logger";


export const GoogleAuthenticatorImportScreen = () => {
  const navigation = useNavigation()
  const { translate, notify, color } = useMixins()
  const { newCipher } = useCipherHelpersMixins()
  const { importCiphers } = useCipherDataMixins()

  const [isLoading, setIsLoading] = useState(false)

  const onSuccess = async (e) => {
    try {
      setIsLoading(true)
      const otps = decodeGoogleAuthenticatorImport(e.data)
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
      Logger.error(e)
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
          title={translate('authenticator.import_from_google_authenticator')}
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
