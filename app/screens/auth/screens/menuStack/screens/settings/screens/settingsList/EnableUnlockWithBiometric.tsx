import { observer } from "mobx-react-lite"
import ReactNativeBiometrics from "react-native-biometrics"

import { Switch } from "app/components/cores"
import { SettingsItem } from "app/components/utils"
import { useStores } from "app/models"
import { useCoreService } from "app/services/coreService"
import { useBiometricType, useToast } from "app/services/utils"

import { useAppLocale } from "@/i18n"
import { autofillKeyChain } from "@/utils/autofill.ios"

const rn = new ReactNativeBiometrics()

export const EnableUnlockWithBiometric = observer(() => {
  const { user } = useStores()
  const { cryptoService } = useCoreService()
  const { notifyTx } = useToast()
  const { lang } = useAppLocale()
  const { isBiometricAvailable } = useBiometricType()

  const enableBiometric = async () => {
    const available = await isBiometricAvailable()

    if (!available) {
      notifyTx("error", "error:biometric_not_support")
      return
    }

    const { success } = await rn.simplePrompt({
      promptMessage: "Verify FaceID/TouchID",
    })

    if (!success) {
      notifyTx("error", "error:biometric_unlock_failed")
      return
    }

    // Update autofill settings
    await updateAutofillFaceIdSetting(true)

    notifyTx("success", "success:biometric_enabled")
  }

  const updateAutofillFaceIdSetting = async (enabled: boolean) => {
    user.setBiometricUnlock(enabled)
    const hashPasswordAutofill = await cryptoService.getAutofillKeyHash()
    await autofillKeyChain.saveUserInfo({
      email: user.email || "",
      avatar: user.avatar || "",
      hashPass: hashPasswordAutofill || "",
      token: user.apiToken || "",
      language: lang || "en",

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
      textTx={"common:biometric_unlocking"}
      onPress={() => onChage(!user.isBiometricUnlock)}
      RightAccessory={
        <Switch onPress={() => onChage(!user.isBiometricUnlock)} value={user.isBiometricUnlock} />
      }
    />
  )
})
