import { FC, useEffect, useState } from "react"
import { useStores } from "app/models"
import { useCipherData, useCipherHelper } from "app/services/hook"
import { beautifyName, decodeGoogleAuthenticatorImport } from "app/utils/totp"
import { CipherType } from "core/enums"
import { Header, Screen } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { AuthScreenProps } from "app/navigators/navigators.types"
import { useToast } from "app/services/utils"
import { useAppTheme } from "@/utils/useAppTheme"
import { Logger } from "@/utils/logger"
import {
  Camera,
  Code,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera"
import { ActivityIndicator, Dimensions, StyleSheet, View, ViewStyle } from "react-native"
import { ThemedStyle } from "@/theme"
import { delay } from "@/utils/delay"

const { width, height } = Dimensions.get("screen")

export const QRScannerScreen: FC<AuthScreenProps<"qrScannerModal">> = observer(({ navigation }) => {
  const { user } = useStores()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { notifyTx } = useToast()
  const { newCipher } = useCipherHelper()
  const { importCiphers } = useCipherData()

  const [isLoading, setIsLoading] = useState(false)

  // --------------------------COMPUTED-------------------------
  const isFreeAccount = user.isFreePlan

  const onSuccess = async (codes: Code[]) => {
    if (!isLoading) {
      if (codes.length > 0 && codes[0].type === "qr" && codes[0].value) {
        setIsLoading(true)
        if (codes[0].value.startsWith("otpauth-migration://")) {
          handleGoogleAuthenticatorImport(codes[0].value)
        } else {
          handleSaveQr(codes[0].value)
        }
      }
    }
  }

  const handleSaveQr = async (uri: string) => {
    navigation.goBack()
    delay(20).then(() => {
      navigation.navigate("browseStack", {
        screen: "cipherEdit",
        params: {
          mode: "add",
          cipherType: CipherType.TOTP,
          otpUri: uri,
        },
      })
    })

    // const payload = parseOTPUri(uri)
    // try {
    //   const otp = getTOTP(payload)
    //   if (otp) {
    //     const cipher = newCipher(CipherType.TOTP)
    //     cipher.name = beautifyName(payload.account || "")
    //     cipher.notes = uri
    //     await createCipher(cipher, 0, [])
    //   } else {
    //     notifyTx("error", "authenticator:invalid_qr")
    //   }
    // } catch (e) {
    //   Logger.error("Save QR: " + e)
    //   notifyTx("error", "authenticator:invalid_qr")
    // }
    // setIsLoading(false)
    // navigation.goBack()
  }

  const handleGoogleAuthenticatorImport = async (uri: string) => {
    try {
      const otps = decodeGoogleAuthenticatorImport(uri)

      const ciphers = otps.map((otp) => {
        const payload = newCipher(CipherType.TOTP)
        payload.name = beautifyName(otp.account || "")
        payload.notes =
          `otpauth://totp/${encodeURIComponent(otp.account || "")}` +
          `?secret=${otp.secret}` +
          `&issuer=${encodeURIComponent(otp.account || "")}` +
          `&algorithm=${otp.algorithm?.toLowerCase().split("-").join("")}` +
          `&digits=${otp.digits}&period=${otp.period}`
        return payload
      })

      if (!ciphers.length) {
        notifyTx("error", "authenticator:invalid_qr")
        return
      }

      await importCiphers({
        importResult: { ciphers },
        setImportedCount: () => null,
        setTotalCount: () => null,
        setIsLimited: () => null,
        isFreeAccount,
      } as any)
    } catch (e) {
      Logger.error("Import google qr: " + e)
      notifyTx("error", "authenticator:invalid_qr")
    }
    setIsLoading(false)
    navigation.goBack()
  }

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: onSuccess,
  })

  const device = useCameraDevice("back")
  const { hasPermission, requestPermission } = useCameraPermission()

  useEffect(() => {
    if (!hasPermission) {
      requestPermission()
    }
  }, [hasPermission, requestPermission])

  if (!hasPermission) return null
  if (device == null) return null

  // -------------------- RENDER ----------------------

  return (
    <Screen
      safeAreaEdges={["bottom"]}
      backgroundColor={colors.block}
      header={
        <Header
          leftIcon="arrow-left"
          titleTx={"authenticator:scan_a_qr"}
          onLeftPress={navigation.goBack}
        />
      }
      contentContainerStyle={styles.flex}
    >
      <Camera isActive={true} device={device} codeScanner={codeScanner} style={styles.camera} />
      <View style={styles.overlay}>
        <View style={themed($overlay)} />
      </View>
      {isLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={colors.border} />
        </View>
      )}
    </Screen>
  )
})

const $overlay: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: width - 32,
  height: width - 32,
  borderRadius: 24,
  borderWidth: 12,
  borderColor: colors.border,
})

const styles = StyleSheet.create({
  camera: {
    height,
    width,
  },
  flex: {
    flex: 1,
  },
  overlay: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
})
