import { useStores } from "app/models"
import { useTheme } from "app/services/context"
import { useHelper } from "app/services/hook"
import { AutofillDataType, loadShared, saveShared } from "app/utils/keychain"
import React from "react"
import { View, Image } from "react-native"
import ReactNativeBiometrics from "react-native-biometrics"
import { Icon, Text } from "app/components/cores"

const FACEID = require("assets/images/intro/faceid.png")

export const SuggestEnableFaceID = ({ isShow, onClose }) => {
  const { notify } = useHelper()
  const { colors } = useTheme()
  const { user } = useStores()

  const handleUseBiometric = async () => {
    const { success } = await ReactNativeBiometrics.simplePrompt({
      promptMessage: "Verify FaceID/TouchID",
    })
    if (!success) {
      notify("error", translate("error.biometric_unlock_failed"))
      onClose()
      return
    }

    user.setBiometricUnlock(true)
    await _updateAutofillFaceIdSetting(true)
    notify("success", translate("success.biometric_enabled"))
    user.setBiometricIntroShown(true)
    onClose()
  }

  const _updateAutofillFaceIdSetting = async (enabled: boolean) => {
    const credentials = await loadShared()
    if (credentials && credentials.password) {
      const sharedData: AutofillDataType = JSON.parse(credentials.password)
      sharedData.faceIdEnabled = enabled
      await saveShared("autofill", JSON.stringify(sharedData))
    }
  }

  const { translate } = useHelper()
  return (
    isShow && (
      <View
        style={{
          borderWidth: 1,
          marginVertical: 12,
          marginHorizontal: 16,
          borderColor: colors.palette.orange8,
          backgroundColor: colors.palette.orange3,
          flexDirection: "row",
          paddingVertical: 16,
          paddingHorizontal: 20,
          borderRadius: 12,
        }}
      >
        <Image
          source={FACEID}
          resizeMode="contain"
          style={{ height: 32, width: 36, marginRight: 16 }}
        />

        <View style={{ marginRight: 80 }}>
          <Text text={translate("biometric_intro.suggest")} />
          <Text
            preset="bold"
            text={translate("common.enable")}
            color={colors.link}
            style={{
              marginTop: 10,
            }}
            onPress={handleUseBiometric}
          />
        </View>
        <View
          style={{
            position: "absolute",
            top: 20,
            right: 20,
          }}
        >
          <Icon
            icon="x"
            size={20}
            onPress={() => {
              onClose(true)
            }}
          />
        </View>
      </View>
    )
  )
}
