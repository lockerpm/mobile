import { NativeStackScreenProps } from "@react-navigation/native-stack"

export type NotificationSettingsRoute = {
  notiOptions: undefined
  deviceNoti: undefined
  emailNoti: undefined
}

export type NotificationSettingsScreenProps<T extends keyof NotificationSettingsRoute> =
  NativeStackScreenProps<NotificationSettingsRoute, T>
