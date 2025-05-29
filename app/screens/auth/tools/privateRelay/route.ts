import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RelayAddress, SubdomainData } from "app/static/types"

type RelayInfoParams =
  | {
      kind: "email"
      email: string
    }
  | {
      kind: "subdomain"
      subdomain: string
    }

export type PrivateRelayRoute = {
  relay: undefined
  manageSubdomain: {
    subdomain: SubdomainData
  }
  aliasStatistic: {
    alias: RelayAddress
  }
  relayInfo: {
    freeAccount: boolean
    data: RelayInfoParams
  }
  relayAction: {
    freeAccount: boolean
    item: RelayAddress
    isEditable: boolean
    isEdit: boolean
  }
  editSubdomain: {
    subdomain: SubdomainData
  }
}

export type PrivateRelayScreenProps<T extends keyof PrivateRelayRoute> = NativeStackScreenProps<
  PrivateRelayRoute,
  T
>
