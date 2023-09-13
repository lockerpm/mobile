import React, { useState } from "react"
import { View } from "react-native"
import { useNavigation } from "@react-navigation/core"
import { Header, Layout } from "../../../../../components"
import QRCodeScanner from "react-native-qrcode-scanner"
import { useMixins } from "../../../../../services/mixins"
import { CipherType } from "../../../../../../core/enums"
import {
  parseOTPUri,
  getTOTP,
  beautifyName,
  decodeGoogleAuthenticatorImport,
} from "../../../../../utils/totp"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data"
import { Logger } from "../../../../../utils/utils"
import { useStores } from "../../../../../models"
import { RouteProp, useRoute } from "@react-navigation/native"
import { PrimaryParamList } from "../../../../../navigators"

type QRScannerScreenProp = RouteProp<PrimaryParamList, "qrScanner">

export const QRScannerScreen = function QRScannerScreen() {
  const navigation = useNavigation()
  const { user, cipherStore } = useStores()
  const route = useRoute<QRScannerScreenProp>()
  const { translate, notify, color } = useMixins()
  const { newCipher } = useCipherHelpersMixins()
  const { createCipher, importCiphers } = useCipherDataMixins()

  const [isLoading, setIsLoading] = useState(false)

  // --------------------------COMPUTED-------------------------
  const isFreeAccount = user.isFreePlan
  const totpCount = route.params.totpCount || 0

  const onSuccess = async (e) => {
    if (e.data.startsWith("otpauth-migration://")) {
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
        notify("error", translate("authenticator.invalid_qr"))
      }
    } catch (e) {
      notify("error", translate("authenticator.invalid_qr"))
    }
    if (!route.params.passwordTotp) {
      navigation.goBack()
    } else {
      cipherStore.setSelectedTotp(uri)
      navigation.navigate("passwords__edit", {
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
          `&algorithm=${otp.algorithm.toLowerCase().split("-").join("")}` +
          `&digits=${otp.digits}&period=${otp.period}`
        return payload
      })

      if (!ciphers.length) {
        notify("error", translate("authenticator.invalid_qr"))
        return
      }

      await importCiphers({
        importResult: { ciphers },
        setImportedCount: () => null,
        setTotalCount: () => null,
        setIsLimited: () => null,
        isFreeAccount,
      } as any)
      if (isFreeAccount && ciphers.length > totpCount) {
        notify(
          "error",
          translate("authenticator.limited_import", {
            imported: ciphers.length - totpCount,
            total: ciphers.length,
            s: ciphers.length - totpCount > 1 ? "s" : "",
          }),
        )
      }
    } catch (e) {
      Logger.error("Import google qr: " + e)
      notify("error", translate("authenticator.invalid_qr"))
    }
    setIsLoading(false)
    if (!route.params.passwordTotp) {
      navigation.goBack()
    } else {
      cipherStore.setSelectedTotp(uri)
      navigation.navigate("passwords__edit", {
        mode: route.params.passwordMode,
      })
    }
  }

  // -------------------- RENDER ----------------------

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0,
      }}
      header={
        <Header
          title={translate("authenticator.scan_a_qr")}
          goBack={() => navigation.goBack()}
          right={<View style={{ width: 30 }} />}
        />
      }
    >
      <QRCodeScanner onRead={onSuccess} />
    </Layout>
  )
}
