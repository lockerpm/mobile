import { PrivateRelayScreenProps } from "../../route"
import { useCallback } from "react"
import { RelayAddress, SubdomainData } from "app/static/types"

export const useRelayNavigation = (
  isFreeAccount: boolean,
  email: string,
  subdomain: SubdomainData,
  navigation: PrivateRelayScreenProps<"relay">["navigation"],
) => {
  const navigateRootEmailInfo = useCallback(() => {
    navigation.navigate("relayInfo", {
      freeAccount: isFreeAccount,
      data: {
        kind: "email",
        email,
      },
    })
  }, [isFreeAccount, email])

  const navigateSubdomainInfo = useCallback(() => {
    navigation.navigate("relayInfo", {
      freeAccount: isFreeAccount,
      data: {
        kind: "subdomain",
        subdomain: subdomain?.subdomain,
      },
    })
  }, [isFreeAccount, subdomain])

  const navigateCreateSubdomain = useCallback(() => {
    //
  }, [])

  const navigateManageSubdomain = useCallback(() => {
    if (!subdomain) {
      return
    }
    navigation.navigate("manageSubdomain", { subdomain })
  }, [subdomain])

  const openRelayActions = useCallback(
    (item: RelayAddress, isEditable: boolean, freeAccount: boolean, isEdit = false) => {
      navigation.navigate("relayAction", { isEditable, item, freeAccount, isEdit })
    },
    [],
  )

  const navigateEditSubdomain = useCallback(() => {
    navigation.navigate("editSubdomain", {
      subdomain,
    })
  }, [subdomain])

  return {
    navigateRootEmailInfo,
    navigateSubdomainInfo,
    navigateCreateSubdomain,
    navigateManageSubdomain,
    navigateEditSubdomain,
    openRelayActions,
  }
}
