import { View, Image, StyleProp, ViewStyle, StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"
import ReactNativeBiometrics from "react-native-biometrics"

import { PressableIcon, Text, PressableText } from "app/components/cores"
import { useStores } from "app/models"
import { useCoreService } from "app/services/coreService"
import { useToast } from "app/services/utils"

import { useAppLocale } from "@/i18n"
import { autofillKeyChain } from "@/utils/autofill.ios"
import { useAppTheme } from "@/utils/useAppTheme"

const FACEID = require("assets/images/intro/faceid.png")

interface Props {
  onClose: () => void
  style: StyleProp<ViewStyle>
}

const rnBiometrics = new ReactNativeBiometrics()

export const SuggestEnableFaceID = observer(({ onClose, style }: Props) => {
  const { cryptoService } = useCoreService()
  const { notifyTx } = useToast()
  const { lang } = useAppLocale()
  const {
    theme: { colors },
  } = useAppTheme()
  const { user } = useStores()

  const handleUseBiometric = async () => {
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: "Verify FaceID/TouchID",
    })
    if (!success) {
      notifyTx("error", "error:biometric_unlock_failed")
      onClose()
      return
    }

    await _updateAutofillFaceIdSetting()
    notifyTx("success", "success:biometric_enabled")
    user.setBiometricIntroShown(true)
    onClose()
  }

  const _updateAutofillFaceIdSetting = async () => {
    user.setBiometricUnlock(true)
    const hashPasswordAutofill = await cryptoService.getAutofillKeyHash()
    await autofillKeyChain.saveUserInfo({
      email: user.email || "",
      avatar: user.avatar || "",
      hashPass: hashPasswordAutofill || "",
      token: user.apiToken || "",
      language: lang || "en",

      faceIdEnabled: true,
      isFree: user.isFreePlan,
    })
  }

  return (
    <View style={style}>
      <Image source={FACEID} resizeMode="contain" style={styles.image} />
      <View style={styles.content}>
        <Text tx={"biometric_intro:suggest"} />
        <PressableText
          preset="bold"
          tx={"common:enable"}
          color={colors.link}
          style={styles.label}
          onPress={handleUseBiometric}
        />
      </View>

      <PressableIcon icon="x" size={20} onPress={onClose} containerStyle={styles.close} />
    </View>
  )
})

const styles = StyleSheet.create({
  close: {
    alignItems: "center",
    height: 32,
    justifyContent: "flex-start",
    width: 32,
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    marginHorizontal: 8,
  },
  image: {
    height: 32,
    marginLeft: 4,
    width: 32,
  },
  label: {
    marginTop: 10,
  },
})
