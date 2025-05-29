import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { OnPremiseIdentifierData } from "app/static/types"

export type SSORoute = {
  ssoIdentifier: undefined
  ssoLogin: OnPremiseIdentifierData
}

export type SSOScreenProps<T extends keyof SSORoute> = NativeStackScreenProps<SSORoute, T>
