import { StackScreenProps } from "@react-navigation/stack"

export type NotificationSettingsRoute = {
  notiOptions: undefined
  deviceNoti: undefined
  emailNoti: undefined
}

export type NotificationSettingsScreenProps<T extends keyof NotificationSettingsRoute> =
  StackScreenProps<NotificationSettingsRoute, T>
