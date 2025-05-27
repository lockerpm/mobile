import React from "react"
import { SettingsItem } from "app/components/utils"
import { useHelper } from "app/services/hook"
import { Toggle } from "app/components/cores"
import { useStores } from "app/models"
import { useCoreService } from "app/services/coreService"
import ReactNativeBiometrics from "react-native-biometrics"
import { autofillKeyChain } from "app/utils/autofillData"
import { observer } from "mobx-react-lite"
import { useBiometricType } from "app/services/utils"
import { useAppLocale } from "app/services/context"

export const EnableAutofillItem = observer(() => {
  const { user } = useStores()
  const { cryptoService } = useCoreService()
  const { notify } = useHelper()
  const { translate } = useAppLocale()
  const { isBiometricAvailable } = useBiometricType()

  const enableBiometric = async () => {
    const available = await isBiometricAvailable()

    if (!available) {
      notify("error", translate("error.biometric_not_support"))
      return
    }

    const { success } = await ReactNativeBiometrics.simplePrompt({
      promptMessage: "Verify FaceID/TouchID",
    })

    if (!success) {
      notify("error", translate("error.biometric_unlock_failed"))
      return
    }

    // Update autofill settings
    await updateAutofillFaceIdSetting(true)

    notify("success", translate("success.biometric_enabled"))
  }

  const updateAutofillFaceIdSetting = async (enabled: boolean) => {
    user.setBiometricUnlock(enabled)
    const hashPasswordAutofill = await cryptoService.getAutofillKeyHash()
    await autofillKeyChain.saveUserInfo({
      email: user.email || "",
      avatar: user.avatar || "",
      hashPass: hashPasswordAutofill || "",
      token: user.apiToken || "",
      language: user.language || "en",

      faceIdEnabled: enabled,
      isFree: user.isFreePlan,
    })
  }

  const onChage = (isActive: boolean) => {
    if (isActive) {
      enableBiometric()
    } else {
      updateAutofillFaceIdSetting(false)
    }
  }
  return (
    <SettingsItem
      textTx={"common.biometric_unlocking"}
      onPress={() => onChage(!user.isBiometricUnlock)}
      RightAccessory={
        <Toggle variant="switch" value={user.isBiometricUnlock} onValueChange={onChage} />
      }
    />
  )
})
