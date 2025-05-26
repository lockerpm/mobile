import { StackScreenProps } from "@react-navigation/stack"

export type MenuRoute = {
  help: undefined
  inviteMember: undefined
  managePlan: undefined
  settingsStack: undefined
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

export type MenuScreenProps<T extends keyof MenuRoute> = StackScreenProps<MenuRoute, T>
