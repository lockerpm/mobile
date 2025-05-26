import { StackScreenProps } from "@react-navigation/stack"

export type SettingsRoute = {
  settings: undefined
  notificationSettings: undefined
  changeMasterPassword: undefined
  autofillService: undefined
  import: undefined
  export: undefined
  emergencyAccess: undefined
}

export type SettingsScreenProps<T extends keyof SettingsRoute> = StackScreenProps<SettingsRoute, T>
