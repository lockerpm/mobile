import { useStores } from "app/models"
import { useAppLocale, useTheme } from "app/services/context"
import { useHelper } from "app/services/hook"
import React from "react"
import { View, Image, StyleProp, ViewStyle, StyleSheet } from "react-native"
import ReactNativeBiometrics from "react-native-biometrics"
import { Icon, Text, TouchableText } from "app/components/cores"
import { useCoreService } from "app/services/coreService"
import { autofillKeyChain } from "app/utils/autofillData"
import { observer } from "mobx-react-lite"
import { useToast } from "app/services/utils"

const FACEID = require("assets/images/intro/faceid.png")

interface Props {
  onClose: () => void
  style: StyleProp<ViewStyle>
}

export const SuggestEnableFaceID = observer(({ onClose, style }: Props) => {
  const { cryptoService } = useCoreService()
  const { notifyTx } = useToast()
  const { translate } = useAppLocale()
  const { colors } = useTheme()
  const { user } = useStores()

  const handleUseBiometric = async () => {
    const { success } = await ReactNativeBiometrics.simplePrompt({
      promptMessage: "Verify FaceID/TouchID",
    })
    if (!success) {
      notifyTx("error", "error.biometric_unlock_failed")
      onClose()
      return
    }

    await _updateAutofillFaceIdSetting()
    notifyTx("success", "success.biometric_enabled")
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
      language: user.language || "en",

      faceIdEnabled: true,
      isFree: user.isFreePlan,
    })
  }

  return (
    <View style={style}>
      <Image source={FACEID} resizeMode="contain" style={styles.image} />
      <View style={styles.content}>
        <Text text={translate("biometric_intro.suggest")} />
        <TouchableText
          preset="bold"
          text={translate("common.enable")}
          color={colors.link}
          style={styles.label}
          onPress={handleUseBiometric}
        />
      </View>

      <Icon icon="x" size={20} onPress={onClose} containerStyle={styles.close} />
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
