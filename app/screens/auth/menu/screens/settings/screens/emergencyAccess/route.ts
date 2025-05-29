import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { TrustedContact } from "app/static/types"

export type EmergencyAccessRoute = {
  emergencyOptions: undefined
  yourTrustedContact: undefined
  contactsTrustedYou: undefined
  viewEA: {
    trusted: TrustedContact
  }
  takeoverEA: {
    trusted: TrustedContact
    reset_pw: boolean
  }
}

export type EmergencyAccessScreenProps<T extends keyof EmergencyAccessRoute> =
  NativeStackScreenProps<EmergencyAccessRoute, T>
