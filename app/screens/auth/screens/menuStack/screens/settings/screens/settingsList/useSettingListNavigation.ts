import { useNavigation } from "@react-navigation/native"
import { SettingsScreenProps } from "app/navigators"

export const useSettingListNavigation = () => {
  const navigation = useNavigation<SettingsScreenProps<"settings">["navigation"]>()

  const navigateToChangePassword = () => {
    navigation.navigate("changeMasterPassword")
  }
  const navigateToNotificationSettings = () => {
    navigation.navigate("notificationSettings")
  }
  const navigateToEmergencyAccess = () => {
    navigation.navigate("emergencyAccess")
  }
  const navigateToEnableAutofillService = () => {
    navigation.navigate("autofillService")
  }
  const navigateToImport = () => {
    navigation.navigate("import")
  }
  const navigateToExport = () => {
    navigation.navigate("export")
  }

  return {
    navigateToChangePassword,
    navigateToNotificationSettings,
    navigateToEmergencyAccess,
    navigateToEnableAutofillService,
    navigateToImport,
    navigateToExport,
  }
}
