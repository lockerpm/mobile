import { observer } from "mobx-react-lite"

import { Switch } from "app/components/cores"
import { SettingsItem } from "app/components/utils"
import { useStores } from "app/models"
import { useCoreService } from "app/services/coreService"
import { getDeviceAuthCapabilities, promptDeviceAuth, useToast } from "app/services/utils"

import { useAppLocale } from "@/i18n"
import { autofillKeyChain } from "@/utils/autofill.ios"

export const EnableUnlockWithBiometric = observer(() => {
  const { user } = useStores()
  const { cryptoService } = useCoreService()
  const { notifyTx } = useToast()
  const { lang, translate } = useAppLocale()

  const enableBiometric = async () => {
    const { hasBiometric, hasDevicePasscode } = await getDeviceAuthCapabilities()

    if (!hasBiometric && !hasDevicePasscode) {
      notifyTx("error", "error:biometric_not_support")
      return
    }

    const { success, error } = await promptDeviceAuth({
      promptMessage: translate("common:unlock_locker"),
      allowDeviceCredential: true,
      fallbackLabel: translate("common:use_device_passcode"),
    })

    if (!success) {
      if (error !== "user_cancel" && error !== "system_cancel") {
        notifyTx("error", "error:biometric_unlock_failed")
      }
      return
    }

    // Update autofill settings
    await updateAutofillFaceIdSetting(true)

    notifyTx(
      "success",
      hasBiometric ? "success:biometric_enabled" : "success:device_passcode_enabled",
    )
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
