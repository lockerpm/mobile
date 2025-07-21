import { FC } from "react"
import { useStores } from "app/models"
import { Header, Screen } from "app/components/cores"
import { SettingsItem, MenuItemContainer } from "app/components/utils"
import { observer } from "mobx-react-lite"
import { SetlanguageItem } from "./SetLanguageItem"
import { SetThemeItem } from "./SetThemeItem"
import { SyncDataItem } from "./SyncDataItem"
import { EnableUnlockWithBiometric } from "./EnableUnlockWithBiometric"
import { useSettingListNavigation } from "./useSettingListNavigation"
import { Linking, ViewStyle } from "react-native"
import { SettingsScreenProps } from "app/navigators"
import { useAppTheme } from "@/utils/useAppTheme"
import { openDeleteAccount } from "@/utils/openLinkInBrowser"
import { HideMasterPasswordItem } from "./HideMasterPasswordItem"

export const SettingsScreen: FC<SettingsScreenProps<"settings">> = observer(({ navigation }) => {
  const { user } = useStores()
  const {
    theme: { colors },
  } = useAppTheme()

  // ----------------------- METHODS -----------------------
  const openPasskeySettingUrl = () => {
    Linking.openURL(
      `https://id.locker.io/authenticate?token=${encodeURI(user.apiToken)}&path=${encodeURI(
        "/security/webauthn"
      )}`
    )
  }

  const {
    navigateToChangePassword,
    navigateToNotificationSettings,
    navigateToEnableAutofillService,
    navigateToImport,
    navigateToExport,
  } = useSettingListNavigation()

  // ----------------------- RENDER --------------------

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["bottom"]}
      header={
        <Header leftIcon="arrow-left" onLeftPress={navigation.goBack} titleTx={"common:settings"} />
      }
      backgroundColor={colors.block}
      contentContainerStyle={$container}
    >
      <MenuItemContainer titleTx={"common:account"}>
        {!user.isPasswordlessLogin && (
          <SettingsItem textTx={"settings:change_master_pass"} onPress={navigateToChangePassword} />
        )}
        <SettingsItem textTx={"common:notifications"} onPress={navigateToNotificationSettings} />

        <SetlanguageItem />
        <SetThemeItem />
      </MenuItemContainer>

      <MenuItemContainer titleTx={"common:security"}>
        {/* <SettingsItem textTx={"emergency_access:title"} onPress={navigateToEmergencyAccess} /> */}
        <SettingsItem
          textTx={"settings:autofill_service"}
          onPress={navigateToEnableAutofillService}
        />
        <SettingsItem textTx={"passkey:login_passkey_setting"} onPress={openPasskeySettingUrl} />

        <HideMasterPasswordItem />
        <EnableUnlockWithBiometric />
      </MenuItemContainer>

      <MenuItemContainer titleTx={"common:data"}>
        <SyncDataItem />
        <SettingsItem textTx={"settings:import"} onPress={navigateToImport} />
        <SettingsItem textTx={"settings:export"} onPress={navigateToExport} />
      </MenuItemContainer>

      <MenuItemContainer titleTx={"settings:danger_zone"}>
        <SettingsItem
          color={colors.error}
          textTx={"settings:delete_account"}
          onPress={openDeleteAccount}
        />
      </MenuItemContainer>
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingHorizontal: 16,
}
