import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native"
import { useStores } from "app/models"
import { CipherEditHelperModal, RelayAddress, SubdomainData } from "app/static/types"
import { BottomModalContainer, PressableIcon, Switch, Text } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { AnalyticEvents, logFirebaseEvent } from "app/utils/analytics"
import { useAppLocale } from "@/i18n"
import { useToast } from "@/services/utils"
// @ts-ignore
import { AliasItem } from "./AliasItem"
import { useAppTheme } from "@/utils/useAppTheme"
import { debounce } from "lodash"
import { AppEventType, EventBus } from "@/utils/eventBus"

const FREE_PLAM_ALIAS_LIMIT = 1
const PAGE_SIZE = 10

const height = Dimensions.get("window").height

type Props = {
  onClose: () => void
  setNexModal: (modal: CipherEditHelperModal) => void
}

export const HideEmail = observer(({ setNexModal, onClose }: Props) => {
  const { notifyApiError } = useToast()
  const { toolStore, user } = useStores()
  const {
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()

  const [alias, setAlias] = useState<RelayAddress[]>([])
  const [page, setPage] = useState(1)
  const [isEndReached, setIsEndReached] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isCreateLoading, setIsCreateLoading] = useState(false)
  // subdomain
  const [subdomain, setSubdomain] = useState<SubdomainData | null>(null)

  const [useSubdomain, setUseSubdomain] = useState(false)

  const userEmail = user.email || "" // Ensure email is defined

  // ----------------------------CONPUTED----------------------------

  const isFreeAccount = user.isFreePlan
  const isReachLimit = isFreeAccount && alias.length >= FREE_PLAM_ALIAS_LIMIT
  const suffixitle = isFreeAccount ? ` (${alias.length}/1)` : ` (${alias.length})`

  // ----------------------------METHODS----------------------------

  const useSubdomainForGenerate = async () => {
    setUseSubdomain(!useSubdomain)
    const res = await toolStore.useSubdomain(!useSubdomain)
    if (res.kind !== "ok") {
      notifyApiError(res)
    }
  }

  const fetchUseSubdomain = useCallback(async () => {
    const res = await toolStore.fetchUseSubdomain()
    if (res.kind === "ok") {
      setUseSubdomain(res.data)
    }
  }, [toolStore])

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
    if (isReachLimit) {
      setNexModal(CipherEditHelperModal.PREMIUM_ACTION)
      return
    }
    setIsCreateLoading(true)
    const res = await toolStore.generateRelayNewAddress()
    if (res.kind === "ok") {
      logFirebaseEvent(AnalyticEvents.CREATE_PRIVATE_EMAIL, userEmail)
      setAlias((prev) => [res.data, ...prev])
    } else {
      notifyApiError(res)
    }
    setIsCreateLoading(false)
  }, [userEmail, isReachLimit])

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

  const onSelect = useCallback((item: RelayAddress) => {
    EventBus.emit(AppEventType.CIPHER_EDIT_HIDE_EMAIL, item.full_address)
    onClose()
  }, [])
  // ----------------------------EFFECTS----------------------------
  useEffect(() => {
    loadData()
  }, [page])

  useEffect(() => {
    fetchRelayDomain()
    fetchUseSubdomain()
  }, [fetchRelayDomain, fetchUseSubdomain])

  const renderFooter = () => {
    if (!loading) return null
    return <ActivityIndicator style={styles.indicator} />
  }

  // ----------------------------RENDER----------------------------
  return (
    <BottomModalContainer
      preset="default"
      style={{
        height: height * 0.7,
      }}
    >
      <View style={styles.header}>
        <Text preset="bold" size="lg" text={translate("private_relay:title") + suffixitle} />
        <View>
          {!isCreateLoading && (
            <PressableIcon
              icon="plus"
              color={isReachLimit ? colors.disable : colors.primary}
              size={24}
              onPress={debounce(generateRelayNewAddress, 400)}
            />
          )}
          {isCreateLoading && <ActivityIndicator color={colors.primary} size={24} />}
        </View>
      </View>

      <FlatList
        data={alias}
        ListHeaderComponent={
          !!subdomain ? (
            <View>
              <Text preset="label" tx={"private_relay:manage_subdomain.your_subdomain"} />
              <Text preset="bold" text={`${subdomain.subdomain}.maily.org`} />
              <TouchableOpacity onPress={useSubdomainForGenerate}>
                <View style={styles.useContainer}>
                  <Text
                    size="sm"
                    tx={"private_relay:manage_subdomain.use_subdomain"}
                    style={styles.useText}
                  />
                  <Switch value={useSubdomain} />
                </View>
              </TouchableOpacity>
            </View>
          ) : undefined
        }
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) => item.address}
        renderItem={({ item }) => <AliasItem item={item} onSelect={onSelect} />}
        onEndReached={handleLoadMore}
        ListFooterComponent={renderFooter}
        onEndReachedThreshold={0.5}
      />
    </BottomModalContainer>
  )
})

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  indicator: { margin: 10 },
  listContainer: {
    paddingHorizontal: 16,
  },
  useContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  useText: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
})
