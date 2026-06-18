import { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"

import { Switch } from "app/components/cores"
import { SettingsItem } from "app/components/utils"
import { useStores } from "app/models"
import { useCoreService } from "app/services/coreService"
import {
  DeviceAuthCapabilities,
  getDeviceAuthCapabilities,
  promptDeviceAuth,
  useToast,
} from "app/services/utils"

import { useAppLocale } from "@/i18n"
import { autofillKeyChain } from "@/utils/autofill.ios"

export const EnableUnlockWithBiometric = observer(() => {
  const { user } = useStores()
  const { cryptoService } = useCoreService()
  const { notifyTx } = useToast()
  const { lang, translate } = useAppLocale()

  const [caps, setCaps] = useState<DeviceAuthCapabilities | null>(null)

  useEffect(() => {
    getDeviceAuthCapabilities().then(setCaps)
  }, [])

  const enableBiometric = async () => {
    const fresh = await getDeviceAuthCapabilities()
    setCaps(fresh)

    if (!fresh.hasBiometric && !fresh.hasDevicePasscode) {
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
        notifyTx(
          "error",
          fresh.hasBiometric
            ? "error:biometric_unlock_failed"
            : "error:device_passcode_unlock_failed"
        )
      }
      return
    }

    await updateAutofillFaceIdSetting(true)

    notifyTx(
      "success",
      fresh.hasBiometric ? "success:biometric_enabled" : "success:device_passcode_enabled"
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

  if (caps === null) return null
  if (!caps.hasBiometric && !caps.hasDevicePasscode) return null

  return (
    <SettingsItem
      textTx={
        caps.hasBiometric ? "common:biometric_unlocking" : "common:unlock_with_device_passcode"
      }
      onPress={() => onChage(!user.isBiometricUnlock)}
      RightAccessory={
        <Switch onPress={() => onChage(!user.isBiometricUnlock)} value={user.isBiometricUnlock} />
      }
    />
  )
})
