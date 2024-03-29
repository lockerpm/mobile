/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, useState } from 'react'
import QRCodeScanner from 'react-native-qrcode-scanner'
import { useStores } from 'app/models'
import { useCipherData, useCipherHelper, useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { beautifyName, decodeGoogleAuthenticatorImport, getTOTP, parseOTPUri } from 'app/utils/totp'
import { CipherType } from 'core/enums'
import { Logger } from 'app/utils/utils'
import { Header, Screen } from 'app/components/cores'
import { observer } from 'mobx-react-lite'
import { AppStackScreenProps } from 'app/navigators/navigators.types'

export const QRScannerScreen: FC<AppStackScreenProps<'qrScanner'>> = observer((props) => {
  const navigation = props.navigation
  const route = props.route

  const { cipherStore } = useStores()
  const { colors } = useTheme()
  const { notify, translate } = useHelper()
  const { newCipher } = useCipherHelper()
  const { createCipher, importCiphers } = useCipherData()

  const [isLoading, setIsLoading] = useState(false)

  // --------------------------COMPUTED-------------------------
  const totpCount = route.params.totpCount || 0

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
    if (!route.params.passwordTotp) {
      navigation.goBack()
    } else {
      cipherStore.setSelectedTotp(uri)
      navigation.navigate('passwords__edit', {
        mode: route.params.passwordMode,
      })
    }
  }

  const handleGoogleAuthenticatorImport = async (uri: string) => {
    try {
      setIsLoading(true)
      const otps = decodeGoogleAuthenticatorImport(uri)

      const ciphers = otps.map((otp) => {
        const payload = newCipher(CipherType.TOTP)
        payload.name = beautifyName(otp.account)
        payload.notes =
          `otpauth://totp/${encodeURIComponent(otp.account)}` +
          `?secret=${otp.secret}` +
          `&issuer=${encodeURIComponent(otp.account)}` +
          `&algorithm=${otp.algorithm.toLowerCase().split('-').join('')}` +
          `&digits=${otp.digits}&period=${otp.period}`
        return payload
      })

      if (!ciphers.length) {
        notify('error', translate('authenticator.invalid_qr'))
        return
      }

      await importCiphers({
        importResult: { ciphers },
        setImportedCount: () => null,
        setTotalCount: () => null,
        setIsLimited: () => null,
      } as any)
    } catch (e) {
      Logger.error('Import google qr: ' + e)
      notify('error', translate('authenticator.invalid_qr'))
    }
    setIsLoading(false)
    if (!route.params.passwordTotp) {
      navigation.goBack()
    } else {
      cipherStore.setSelectedTotp(uri)
      navigation.navigate('passwords__edit', {
        mode: route.params.passwordMode,
      })
    }
  }

  // -------------------- RENDER ----------------------

  return (
    <Screen
      safeAreaEdges={['bottom']}
      backgroundColor={colors.block}
      header={
        <Header
          leftIcon="arrow-left"
          title={translate('authenticator.scan_a_qr')}
          onLeftPress={() => navigation.goBack()}
        />
      }
      contentContainerStyle={{
        flex: 1,
      }}
    >
      <QRCodeScanner onRead={onSuccess} />
    </Screen>
  )
})
