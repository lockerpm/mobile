import { View, Image, StyleProp, ViewStyle, StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"

import { PressableIcon, Text, PressableText } from "app/components/cores"
import { useStores } from "app/models"
import { useCoreService } from "app/services/coreService"
import { promptDeviceAuth, useToast } from "app/services/utils"

import { useAppLocale } from "@/i18n"
import { autofillKeyChain } from "@/utils/autofill.ios"
import { useAppTheme } from "@/utils/useAppTheme"

const FACEID = require("assets/images/intro/faceid.png")

interface Props {
  onClose: () => void
  style: StyleProp<ViewStyle>
  hasBiometric: boolean
}

export const SuggestEnableFaceID = observer(({ onClose, style, hasBiometric }: Props) => {
  const { cryptoService } = useCoreService()
  const { notifyTx } = useToast()
  const { lang, translate } = useAppLocale()
  const {
    theme: { colors },
  } = useAppTheme()
  const { user } = useStores()

  const handleUseBiometric = async () => {
    const { success, error } = await promptDeviceAuth({
      promptMessage: translate("common:unlock_locker"),
      allowDeviceCredential: true,
      fallbackLabel: translate("common:use_device_passcode"),
    })
    if (!success) {
      if (error !== "user_cancel" && error !== "system_cancel") {
        notifyTx(
          "error",
          hasBiometric ? "error:biometric_unlock_failed" : "error:device_passcode_unlock_failed"
        )
      }
      onClose()
      return
    }

    await _updateAutofillFaceIdSetting()
    notifyTx(
      "success",
      hasBiometric ? "success:biometric_enabled" : "success:device_passcode_enabled"
    )
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
        <Text tx={hasBiometric ? "biometric_intro:suggest" : "biometric_intro:suggest_passcode"} />
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
