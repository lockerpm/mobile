import { useState, useEffect, useCallback, useMemo } from "react"
import { View, FlatList, ActivityIndicator, StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

import { Text } from "app/components/cores"
import { SearchBar } from "app/components/utils"
import { useStores } from "app/models"
import { useCipherData } from "app/services/hook"
import { AccountRole, CipherAppView } from "app/static/types"
import { getCipherLogo, getTeam } from "app/utils/cipherHelper"
import { CipherType } from "core/enums"
import { CipherView } from "core/models/view"

import { CipherListItem } from "@/components/ciphers"
import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"

import { CipherListEmpty } from "../../../cipherList/CipherListEmpty"

const allTypes = [
  CipherType.Card,
  CipherType.Login,
  CipherType.Identity,
  CipherType.CryptoWallet,
  CipherType.SecureNote,
]

export interface CipherListProps {
  openAdd: () => void
  /**
   * Open Item actions
   */
  openActionsMenu: (item: CipherAppView) => void
}

/**
 * Describe your component here
 */
export const CipherList = observer(({ openActionsMenu, openAdd }: CipherListProps) => {
  const { cipherStore } = useStores()
  const {
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()
  const { getCiphersFromCache } = useCipherData()

  // ------------------------ PARAMS ----------------------------
  const [searchText, setSearchText] = useState("")

  const [ciphers, setCiphers] = useState<CipherAppView[]>([])

  const [isLoadingDone, setIsLoadingDone] = useState(false)

  // ------------------------ COMPUTED ----------------------------
  const data = useMemo(() => {
    const checkSelectingEditPermission = (c: CipherAppView) => {
      if (c.type === CipherType.MasterPassword) return false
      if (!c.organizationId) return true
      const shareRole = getTeam(cipherStore.organizations, c.organizationId).type

      const isShared = shareRole === AccountRole.MEMBER || shareRole === AccountRole.ADMIN
      return !isShared
    }
    return ciphers.filter(checkSelectingEditPermission)
  }, [ciphers, cipherStore.organizations])

  const masterPassword =
    data.length === 1 && data[0].type === CipherType.MasterPassword ? data[0] : null
  const otherData = masterPassword ? [] : data

  const lastSync = cipherStore.lastSync
  const lastCacheUpdate = cipherStore.lastCacheUpdate
  const notSynchedCiphers = cipherStore.notSynchedCiphers

  // ------------------------ METHODS ----------------------------

  // check if cipher is shared from other user
  // if true, show shared icon
  const isShared = (organizationId: string | null) => {
    if (!organizationId) return false
    const share = cipherStore.myShares.find((s) => s.id === organizationId)
    if (share) {
      return share.members.length > 0 || share.groups.length > 0
    }
    return !!organizationId
  }

  // Check if cipher is not synced or updated
  const isSync = useCallback(
    (id: string) => {
      return [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(id)
    },
    [cipherStore.notSynchedCiphers, cipherStore.notUpdatedCiphers]
  )

  // Get ciphers list
  const loadData = useCallback(async () => {
    // filter
    const filters = [(c: CipherView) => allTypes.includes(c.type)]

    // Search
    const searchRes = await getCiphersFromCache({
      filters,
      searchText,
      deleted: false,
    })

    if (searchRes.length === 0) {
      setCiphers([])
      setIsLoadingDone(true)
      return
    }

    // Add image
    const res: CipherAppView[] = searchRes.map((c: CipherView) => {
      const cipherLogo = getCipherLogo(c)
      const data = {
        ...c,
        imgLogo: cipherLogo,
        notSync: isSync(c.id),
        isDeleted: c.isDeleted,
      }
      return data
    })

    setCiphers(res)
    setIsLoadingDone(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSync, searchText])

  // ------------------------ EFFECTS ----------------------------

  useEffect(() => {
    const timeOut = setTimeout(() => {
      loadData()
    }, 150)
    return () => clearTimeout(timeOut)
  }, [lastSync, lastCacheUpdate, notSynchedCiphers, loadData])

  // ------------------------ RENDER ----------------------------
  const $listContent = useMemo(
    () => ({
      paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom + 12,
    }),
    []
  )

  const renderEmptyComponents = useCallback(() => {
    if (!isLoadingDone) return null

    if (!searchText?.trim()) {
      return <CipherListEmpty onAdd={openAdd} cipherTypes={allTypes} isDeleted={false} />
    }
    return (
      <View style={styles.ph16}>
        {searchText ? (
          <Text
            text={translate("error:no_results_found") + ` '${searchText}'`}
            style={styles.centerText}
          />
        ) : (
          <ActivityIndicator size={30} color={colors.title} />
        )}
      </View>
    )
  }, [colors.title, isLoadingDone, searchText, translate])

  const itemDivider = useCallback(() => {
    return <View style={[styles.divider, { backgroundColor: colors.border }]} />
  }, [colors.border])

  return (
    <View style={styles.flex}>
      <FlatList
        removeClippedSubviews
        maxToRenderPerBatch={15}
        data={otherData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          return (
            <CipherListItem
              item={item}
              isSelecting={false}
              openActionMenu={openActionsMenu}
              isSelected={false}
              isShared={isShared(item.organizationId)}
            />
          )
        }}
        ListHeaderComponent={
          <SearchBar
            containerStyle={styles.searchContainer}
            onChangeText={setSearchText}
            value={searchText}
          />
        }
        contentContainerStyle={$listContent}
        ItemSeparatorComponent={itemDivider}
        ListEmptyComponent={renderEmptyComponents}
        getItemLayout={(data, index) => ({
          length: 71,
          offset: 71 * index,
          index,
        })}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  centerText: {
    marginTop: 20,
    textAlign: "center",
  },
  divider: {
    height: 1,
    marginLeft: 64,
    width: "100%",
  },
  flex: {
    flex: 1,
  },
  ph16: {
    paddingHorizontal: 16,
  },
  searchContainer: {
    marginBottom: 2,
    marginHorizontal: 20,
    marginTop: 10,
  },
})
