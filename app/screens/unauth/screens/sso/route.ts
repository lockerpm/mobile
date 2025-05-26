import { StackScreenProps } from "@react-navigation/stack"
import { OnPremiseIdentifierData } from "app/static/types"

export type SSORoute = {
  ssoIdentifier: undefined
  ssoLogin: OnPremiseIdentifierData
}

export type SSOScreenProps<T extends keyof SSORoute> = StackScreenProps<SSORoute, T>
