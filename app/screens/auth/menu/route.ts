import { NavigatorScreenParams } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { SettingsRoute } from "./screens/settings/route"

export type MenuRoute = {
  help: undefined
  inviteMember: undefined
  managePlan: undefined
  settingsStack: NavigatorScreenParams<SettingsRoute>
  payment: {
    benefitTab?: 0 | 1 | 2 | 3
    family?: boolean
    premium?: boolean
  }
  welcomePremium: undefined
  referFriend: {
    referLink: string | null
  }
}

export type MenuScreenProps<T extends keyof MenuRoute> = NativeStackScreenProps<MenuRoute, T>
