import { FC, useCallback, useEffect, useMemo, useState } from "react"
import { ActivityIndicator, SectionList, StyleSheet } from "react-native"
import { useStores } from "app/models"
import { RelayAddress, SubdomainData } from "app/static/types"
import { Screen, Header, Text } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { AnalyticEvents, logFirebaseEvent } from "app/utils/analytics"
import { RootEmailInfo } from "./RootEmailInfo"
import { SubdomainInfo } from "./SubdomainInfo"
import { AliasItem } from "./PrivateRelayItem"
import { useRelayNavigation } from "./useRelayNavigation"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { debounce } from "app/utils/utils"
import { PrivateRelayScreenProps } from "app/navigators"
import { useAppLocale } from "@/i18n"
import { Logger } from "@/utils/logger"
import { useToast } from "@/services/utils"
import { useAppTheme } from "@/utils/useAppTheme"

const FREE_PLAM_ALIAS_LIMIT = 1
const PAGE_SIZE = 10

export const PrivateRelay: FC<PrivateRelayScreenProps<"relay">> = observer(({ navigation }) => {
  const { notifyApiError } = useToast()
  const { toolStore, user } = useStores()
  const { translate } = useAppLocale()
  const {
    theme: { colors },
  } = useAppTheme()

  const [alias, setAlias] = useState<RelayAddress[]>([])
  const [page, setPage] = useState(1)
  const [isEndReached, setIsEndReached] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isCreateLoading, setIsCreateLoading] = useState(false)
  // subdomain
  const [subdomain, setSubdomain] = useState<SubdomainData | null>(null)

  const userEmail = user.email || "" // Ensure email is defined

  // ----------------------------CONPUTED----------------------------

  const isFreeAccount = user.isFreePlan
  const isReachLimit = isFreeAccount && alias.length >= FREE_PLAM_ALIAS_LIMIT
  const ramdomEmailAlias = alias.slice(1).reverse() || []
  const suffixitle = isFreeAccount
    ? ` (${ramdomEmailAlias.length}/4)`
    : ` (${ramdomEmailAlias.length})`
  const data =
    alias.length > 0
      ? [
          {
            title: translate("private_relay:editable"),
            data: [alias[0]],
            edited: true,
          },
          {
            title: isFreeAccount ? "" : translate("private_relay:random", { number: suffixitle }),
            data: ramdomEmailAlias,
            edited: false,
          },
        ]
      : []
  // ----------------------------METHODS----------------------------
  const {
    navigateCreateSubdomain,
    navigateRootEmailInfo,
    navigateSubdomainInfo,
    navigateManageSubdomain,
    navigateEditSubdomain,
    openRelayActions,
  } = useRelayNavigation(isFreeAccount, userEmail, subdomain, navigation)

  const fetchRelayDomain = useCallback(async () => {
    const res = await toolStore.fetchSubdomain()
    if (res.kind === "ok") {
      if (res.data.results.length === 0) {
        setSubdomain(null)
      } else {
        setSubdomain(res.data.results[0])
      }
    }
  }, [])

  const generateRelayNewAddress = useCallback(async () => {
    setIsCreateLoading(true)
    const res = await toolStore.generateRelayNewAddress()
    if (res.kind === "ok") {
      logFirebaseEvent(AnalyticEvents.CREATE_PRIVATE_EMAIL, userEmail)
      setAlias((prev) => [...prev, res.data])
    } else {
      notifyApiError(res)
    }
    setIsCreateLoading(false)
  }, [userEmail])

  const loadData = async () => {
    if (loading || isEndReached) return

    setLoading(true)

    // Simulate fetching data
    setTimeout(async () => {
      const res = await toolStore.fetchRelayListAddresses(page)
      if (res.kind === "ok") {
        if (res.data.results.length < PAGE_SIZE) {
          setIsEndReached(true) // No more data to load
        }
        setAlias((prev) => [...prev, ...res.data.results])
      }

      setLoading(false)
    }, 300)
  }

  const handleLoadMore = () => {
    if (!loading && !isEndReached) {
      setPage((prev) => prev + 1)
    }
  }

  const deleteRelayAddress = (id: number) => {
    const newList = alias.filter((a) => a.id !== id)
    setAlias(newList)
  }

  const editRelayAddress = (item: RelayAddress) => {
    const newList = [...alias]
    newList[0] = item
    setAlias(newList)
  }

  const updateSubdomain = (domain: string) => {
    if (!subdomain) return
    setSubdomain({
      ...subdomain,
      subdomain: domain,
    })
  }

  // ----------------------------EFFECTS----------------------------
  useEffect(() => {
    loadData()
  }, [page])

  useEffect(() => {
    fetchRelayDomain()
  }, [fetchRelayDomain])

  useEffect(() => {
    const listener1 = EventBus.createListener(AppEventType.PRIVATE_RELAY_DELETE, (id: number) => {
      Logger.debug("PRIVATE_RELAY_DELETE", id)
      deleteRelayAddress(id)
    })

    const listener2 = EventBus.createListener(
      AppEventType.PRIVATE_RELAY_UPDATE,
      (data: RelayAddress) => {
        Logger.debug("PRIVATE_RELAY_UPDATE")
        editRelayAddress(data)
      }
    )

    const listener3 = EventBus.createListener(
      AppEventType.PRIVATE_RELAY_DOMAIN_EDIT,
      (data: string) => {
        Logger.debug("PRIVATE_RELAY_DOMAIN")
        updateSubdomain(data)
      }
    )

    const listener4 = EventBus.createListener(
      AppEventType.PRIVATE_RELAY_DOMAIN_CREATE,
      (data: SubdomainData) => {
        Logger.debug("PRIVATE_RELAY_DOMAIN_CREATE")
        setSubdomain(data)
      }
    )

    return () => {
      EventBus.removeListener(listener1)
      EventBus.removeListener(listener2)
      EventBus.removeListener(listener3)
      EventBus.removeListener(listener4)
    }
  }, [deleteRelayAddress, editRelayAddress])

  const renderFooter = () => {
    if (!loading) return null
    // eslint-disable-next-line react-native/no-inline-styles
    return <ActivityIndicator style={{ margin: 10 }} />
  }

  // ----------------------------RENDER----------------------------
  const listHeader = useMemo(
    () => (
      <>
        <RootEmailInfo email={userEmail} onPress={navigateRootEmailInfo} />
        {!isFreeAccount && (
          <SubdomainInfo
            subdomain={subdomain}
            onPressInfo={navigateSubdomainInfo}
            onCreate={navigateCreateSubdomain}
            onManage={navigateManageSubdomain}
            onEdit={navigateEditSubdomain}
          />
        )}
      </>
    ),
    [isFreeAccount, userEmail, subdomain]
  )
  return (
    <Screen
      safeAreaEdges={["bottom"]}
      preset="fixed"
      header={
        <Header
          titleTx={"private_relay:title"}
          leftIcon="arrow-left"
          onLeftPress={navigation.goBack}
          titleMode="center"
          rightLoading={isCreateLoading}
          rightIcon="plus"
          rightIconColor={colors.primary}
          rightDisabled={isReachLimit}
          onRightPress={debounce(generateRelayNewAddress, 400)}
        />
      }
      contentContainerStyle={styles.container}
    >
      <SectionList
        bounces={false}
        stickySectionHeadersEnabled={false}
        sections={data}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) => item.address}
        renderItem={({ item, section }) => (
          <AliasItem
            isFreeAccount={isFreeAccount}
            isEditable={section.edited}
            item={item}
            openActions={openRelayActions}
          />
        )}
        renderSectionHeader={({ section: { title } }) => <Text preset="label">{title}</Text>}
        onEndReached={handleLoadMore}
        ListFooterComponent={renderFooter}
        onEndReachedThreshold={0.5}
      />
    </Screen>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
})
