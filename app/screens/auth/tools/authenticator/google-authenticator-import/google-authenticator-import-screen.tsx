import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { useNavigation } from "@react-navigation/core"
import { Header, Layout } from "../../../../../components"
import { color as colorLight, colorDark } from "../../../../../theme"
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useMixins } from "../../../../../services/mixins"
import { CipherType } from "../../../../../../core/enums"
import { decodeGoogleAuthenticatorImport, beautifyName } from "../../../../../utils/totp"
import { useStores } from "../../../../../models"


export const GoogleAuthenticatorImportScreen = observer(function GoogleAuthenticatorImportScreen() {
  const navigation = useNavigation()
  const { newCipher, importCiphers, translate, notify } = useMixins()
  const { uiStore } = useStores()
  const color = uiStore.isDark ? colorDark : colorLight

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
      await importCiphers({
        ciphers,
        folders: [],
        folderRelationships: []
      })
    } catch (e) {
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
})
