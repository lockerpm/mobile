import { useCallback } from "react"
import { RelayAddress, SubdomainData } from "app/static/types"
import { PrivateRelayScreenProps } from "app/navigators"

export const useRelayNavigation = (
  isFreeAccount: boolean,
  email: string,
  subdomain: SubdomainData | null,
  navigation: PrivateRelayScreenProps<"relay">["navigation"]
) => {
  const navigateRootEmailInfo = useCallback(() => {
    navigation.navigate("relayInfo", {
      freeAccount: isFreeAccount,
      data: {
        kind: "email",
        email,
      },
    })
  }, [navigation, isFreeAccount, email])

  const navigateCreateSubdomain = useCallback(() => {
    navigation.navigate("createSubdomain")
  }, [navigation])

  const navigateSubdomainInfo = useCallback(() => {
    navigation.navigate("relayInfo", {
      freeAccount: isFreeAccount,
      data: {
        kind: "subdomain",
        subdomain: subdomain?.subdomain ?? "",
      },
    })
  }, [isFreeAccount, navigation, subdomain?.subdomain])

  const navigateManageSubdomain = useCallback(() => {
    if (!subdomain) {
      return
    }
    navigation.navigate("manageSubdomain", { subdomain })
  }, [navigation, subdomain])

  const openRelayActions = useCallback(
    (item: RelayAddress, isEditable: boolean, freeAccount: boolean, isEdit = false) => {
      navigation.navigate("relayAction", { isEditable, item, freeAccount, isEdit })
    },
    [navigation]
  )

  const navigateEditSubdomain = useCallback(() => {
    if (!subdomain) {
      return
    }
    navigation.navigate("editSubdomain", {
      subdomain,
    })
  }, [navigation, subdomain])

  return {
    navigateCreateSubdomain,
    navigateRootEmailInfo,
    navigateSubdomainInfo,
    navigateManageSubdomain,
    navigateEditSubdomain,
    openRelayActions,
  }
}
