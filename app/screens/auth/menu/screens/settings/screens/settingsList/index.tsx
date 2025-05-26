import React, { FC } from "react"
import { useStores } from "app/models"
import { useTheme } from "app/services/context"
import { Header, Screen } from "app/components/cores"
import { SettingsItem, MenuItemContainer } from "app/components/utils"
import { observer } from "mobx-react-lite"
import { SetlanguageItem } from "./SetLanguageItem"
import { SetThemeItem } from "./SetThemeItem"
import { SetTimeOutItem } from "./SetTimeOutItem"
import { SettingsScreenProps } from "../../route"
import { SyncDataItem } from "./SyncDataItem"
import { EnableAutofillItem } from "./EnableAutofillItem"
import { useSettingListNavigation } from "./useSettingListNavigation"
import { Linking } from "react-native"

export const SettingsScreen: FC<SettingsScreenProps<"settings">> = observer(({ navigation }) => {
  const { user } = useStores()
  const { colors } = useTheme()

  // ----------------------- METHODS -----------------------
  const openPasskeySettingUrl = () => {
    Linking.openURL(
      `https://id.locker.io/authenticate?token=${encodeURI(user.apiToken)}&path=${encodeURI(
        "/security/webauthn",
      )}`,
    )
  }
  const openDeleteAccountUrl = () => {
    Linking.openURL("https://locker.io/settings/account")
  }
  const {
    navigateToChangePassword,
    navigateToNotificationSettings,
    navigateToEmergencyAccess,
    navigateToEnableAutofillService,
    navigateToImport,
    navigateToExport,
  } = useSettingListNavigation()

  // ----------------------- RENDER -----------------------

  return (
    <Screen
      padding
      preset="auto"
      safeAreaEdges={["bottom"]}
      header={
        <Header leftIcon="arrow-left" onLeftPress={navigation.goBack} titleTx={"common.settings"} />
      }
      backgroundColor={colors.block}
    >
      <MenuItemContainer titleTx={"common.account"}>
        {!user.isPasswordlessLogin && (
          <SettingsItem textTx={"settings.change_master_pass"} onPress={navigateToChangePassword} />
        )}
        <SettingsItem textTx={"common.notifications"} onPress={navigateToNotificationSettings} />

        <SetlanguageItem />
        <SetThemeItem />
      </MenuItemContainer>

      <MenuItemContainer titleTx={"common.security"}>
        <SettingsItem textTx={"emergency_access.title"} onPress={navigateToEmergencyAccess} />
        <SettingsItem
          textTx={"settings.autofill_service"}
          onPress={navigateToEnableAutofillService}
        />
        <SettingsItem textTx={"passkey.login_passkey_setting"} onPress={openPasskeySettingUrl} />

        <EnableAutofillItem />
        <SetTimeOutItem />
      </MenuItemContainer>

      <MenuItemContainer titleTx={"common.data"}>
        <SyncDataItem />
        <SettingsItem textTx={"settings.import"} onPress={navigateToImport} />
        <SettingsItem textTx={"settings.export"} onPress={navigateToExport} />
      </MenuItemContainer>

      <MenuItemContainer titleTx={"settings.danger_zone"}>
        <SettingsItem
          color={colors.error}
          textTx={"settings.delete_account"}
          onPress={openDeleteAccountUrl}
        />
      </MenuItemContainer>
    </Screen>
  )
})
