import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { EmergencyAccessRoute } from "./screens/emergencyAccess/route"
import { NavigatorScreenParams } from "@react-navigation/native"
import { NotificationSettingsRoute } from "./screens/notificationSettings/route"

export type SettingsRoute = {
  settings: undefined
  changeMasterPassword: undefined
  autofillService: undefined
  import: undefined
  export: undefined
  emergencyStack: NavigatorScreenParams<EmergencyAccessRoute>
  notiConfigStack: NavigatorScreenParams<NotificationSettingsRoute>
}

export type SettingsScreenProps<T extends keyof SettingsRoute> = NativeStackScreenProps<
  SettingsRoute,
  T
>
