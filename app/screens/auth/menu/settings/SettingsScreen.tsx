/* eslint-disable @typescript-eslint/no-unused-vars */
import moment from "moment"
import React, { useEffect } from "react"
import { Linking, Platform } from "react-native"
import ReactNativeBiometrics from "react-native-biometrics"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { useCipherData, useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"
import { AutofillDataType, loadShared, saveShared } from "app/utils/keychain"
import { Header, Screen, Text, Toggle } from "app/components/cores"
import { SettingsItem, MenuItemContainer, Select } from "app/components/utils"
import { observer } from "mobx-react-lite"
import { AppTimeoutType, TimeoutActionType } from "app/static/types"

const IS_IOS = Platform.OS === "ios"

export const SettingsScreen = observer(() => {
  const navigation = useNavigation() as any
  const { user, uiStore, cipherStore } = useStores()
  const { colors, setIsDark } = useTheme()
  const { notify, isBiometricAvailable, translate } = useHelper()
  const { startSyncProcess } = useCipherData()

  // ----------------------- PARAMS -----------------------

  // ----------------------- METHODS -----------------------

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

    user.setBiometricUnlock(true)

    // Update autofill settings
    await updateAutofillFaceIdSetting(true)

    notify("success", translate("success.biometric_enabled"))
  }

  const updateAutofillFaceIdSetting = async (enabled: boolean) => {
    if (!IS_IOS) {
      return
    }
    const credentials = await loadShared()
    if (credentials && credentials.password) {
      const sharedData: AutofillDataType = JSON.parse(credentials.password)
      sharedData.faceIdEnabled = enabled
      await saveShared("autofill", JSON.stringify(sharedData))
    }
  }

  const updateAutofillLanguage = async (language: "vi" | "en") => {
    if (!IS_IOS) {
      return
    }
    const credentials = await loadShared()
    if (credentials && credentials.password) {
      const sharedData: AutofillDataType = JSON.parse(credentials.password)
      sharedData.language = language
      await saveShared("autofill", JSON.stringify(sharedData))
    }
  }

  const updateAutofillDarkTheme = async (enabled: boolean) => {
    if (!IS_IOS) {
      return
    }
    const credentials = await loadShared()
    if (credentials && credentials.password) {
      const sharedData: AutofillDataType = JSON.parse(credentials.password)
      sharedData.isDarkTheme = enabled
      await saveShared("autofill", JSON.stringify(sharedData))
    }
  }

  const syncDataManually = async () => {
    const res = await startSyncProcess(Date.now())
    // @ts-ignore
    if (res.kind === "ok") {
      notify("success", translate("success.sync_success"))
    }
  }
  // ----------------------- EFFECT -------------------------

  let isBacking = false
  useEffect(() => {
    const handleBack = (e) => {
      if (!["POP", "GO_BACK"].includes(e.data.action.type)) {
        navigation.dispatch(e.data.action)
        return
      }
      if (isBacking) {
        isBacking = false
        navigation.dispatch(e.data.action)
        return
      }

      e.preventDefault()
      isBacking = true
      navigation.goBack()
    }

    navigation.addListener("beforeRemove", handleBack)

    return () => {
      navigation.removeListener("beforeRemove", handleBack)
    }
  }, [navigation])

  // ----------------------- RENDER -----------------------

  const settings = {
    language: {
      value: user.language || "en",
      onChange: (lang: "vi" | "en") => {
        user.setLanguage(lang)
        user.changeLanguage()
        updateAutofillLanguage(lang)
      },
      options: [
        {
          label: "Tiếng Việt",
          value: "vi",
        },
        {
          label: "English",
          value: "en",
        },
      ],
    },
    theme: {
      value: uiStore.isDark ? "dark" : "light",
      onChange: (theme: string) => {
        uiStore.setIsDark(theme === "dark")
        setIsDark(theme === "dark")
        updateAutofillDarkTheme(theme === "dark")
      },
      options: [
        {
          label: translate("settings.light_theme"),
          value: "light",
        },
        {
          label: translate("settings.dark_theme"),
          value: "dark",
        },
      ],
    },
    biometric: {
      value: user.isBiometricUnlock,
      onChage: (isActive: boolean) => {
        if (isActive) {
          enableBiometric()
        } else {
          user.setBiometricUnlock(false)
          updateAutofillFaceIdSetting(false)
        }
      },
    },

    timeout: {
      value: user.appTimeout || 0,
      onChange: user.setAppTimeout,
      options: [
        {
          label: `30 ${translate("common.seconds")}`,
          value: 30 * 1000,
        },
        {
          label: `1 ${translate("common.minute")}`,
          value: 1 * 60 * 1000,
        },
        {
          label: `3 ${translate("common.minutes")}`,
          value: 3 * 60 * 1000,
        },
        {
          label: translate("settings.on_screen_off"),
          value: AppTimeoutType.SCREEN_OFF,
        },
        {
          label: translate("settings.on_app_close"),
          value: AppTimeoutType.APP_CLOSE,
        },
      ],
    },
    timeoutAction: {
      value: user.appTimeoutAction || "lock",
      onChange: user.setAppTimeoutAction,
      options: [
        {
          label: translate("common.lock"),
          value: TimeoutActionType.LOCK,
        },
        {
          label: translate("common.logout"),
          value: TimeoutActionType.LOGOUT,
        },
      ],
    },
  }

  return (
    <Screen
      padding
      preset="auto"
      safeAreaEdges={["bottom"]}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
          title={translate("common.settings")}
        />
      }
      backgroundColor={colors.block}
    >
      <MenuItemContainer title={translate("common.account")}>
        {!user.isPasswordlessLogin && (
          <SettingsItem
            name={translate("settings.change_master_pass")}
            onPress={() => navigation.navigate("changeMasterPassword")}
          />
        )}
        <SettingsItem
          name={translate("common.notifications")}
          onPress={() => navigation.navigate("notificationSettings")}
        />

        <Select
          value={settings.language.value}
          onChange={settings.language.onChange}
          options={settings.language.options}
          title={translate("common.language")}
          renderSelected={({ label }) => (
            <SettingsItem
              name={translate("common.language")}
              RightAccessory={<Text text={label} />}
            />
          )}
        />

        <Select
          value={settings.theme.value}
          onChange={settings.theme.onChange}
          options={settings.theme.options}
          title={translate("settings.theme")}
          renderSelected={({ label }) => (
            <SettingsItem
              name={translate("settings.theme")}
              RightAccessory={<Text text={label} />}
            />
          )}
        />
      </MenuItemContainer>

      <MenuItemContainer title={translate("common.security")}>
        <SettingsItem
          name={translate("emergency_access.title")}
          onPress={() => navigation.navigate("emergencyAccess")}
        />
        <SettingsItem
          name={translate("settings.autofill_service")}
          onPress={() => navigation.navigate("autofillService")}
        />
        <SettingsItem
          name={translate("common.biometric_unlocking")}
          onPress={() => settings.biometric.onChage(!settings.biometric.value)}
          RightAccessory={
            <Toggle
              variant="switch"
              value={settings.biometric.value}
              onValueChange={settings.biometric.onChage}
            />
          }
        />
        <Select
          value={settings.timeout.value}
          onChange={settings.timeout.onChange}
          options={settings.timeout.options}
          renderSelected={({ label }) => (
            <SettingsItem
              name={translate("settings.timeout")}
              RightAccessory={<Text text={label} />}
            />
          )}
        />
      </MenuItemContainer>

      <MenuItemContainer title={translate("common.data")}>
        <SettingsItem
          isLoading={cipherStore.isSynching}
          disabled={uiStore.isOffline || cipherStore.isSynching}
          name={translate("settings.sync_now")}
          onPress={syncDataManually}
          RightAccessory={<Text text={moment(cipherStore.lastSync).fromNow()} />}
        />
        <SettingsItem
          name={translate("settings.import")}
          onPress={() => navigation.navigate("import")}
        />
        <SettingsItem
          name={translate("settings.export")}
          onPress={() => navigation.navigate("export")}
        />
      </MenuItemContainer>
    </Screen>
  )
})
