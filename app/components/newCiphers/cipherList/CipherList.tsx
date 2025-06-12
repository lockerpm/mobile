import orderBy from "lodash/orderBy"
import React, { useState, useEffect, useCallback, useMemo } from "react"
import { View, FlatList, ActivityIndicator, StyleSheet } from "react-native"
import { useStores } from "app/models"
import { useAppLocale, useTheme } from "app/services/context"
import { useCipherData } from "app/services/hook"
import { MAX_CIPHER_SELECTION } from "app/static/constants"
import { AccountRole, CipherAppView } from "app/static/types"
import { CipherType } from "core/enums"
import { CipherView } from "core/models/view"
import { CipherListItem } from "./CipherListItem"
import { Text } from "../../cores"
import { observer } from "mobx-react-lite"
import { useToast } from "app/services/utils"
import { SearchBar } from "app/components/utils"
import { getCipherLogo, getTeam } from "app/utils/cipherHelper"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

export interface CipherListProps {
  /**
   * add safe padding bottom
   */
  safeBottom?: boolean
  /**
   * List empty component
   */
  ListEmptyComponent?: JSX.Element
  /**
   * Cipher type to filter
   */
  cipherTypes: CipherType[]
  /**
   * Show list delete ciphers
   */
  isdeleted?: boolean
  /**
   * Sort configuration
   */
  sort?: {
    orderField: string
    order: "desc" | "asc"
  }
  /**
   * Folder ID to filter ciphers
   */
  folderId?: string
  /**
   * Collection ID to filter ciphers
   */
  collectionId?: string
  /**
   * Organization ID to filter ciphers
   */
  organizationId?: string
  /**
   * Selecting mode
   */
  isSelecting: boolean
  /**
   * Set selecting mode
   */
  setIsSelecting: (val: boolean) => void
  selectedIds: string[]
  setSelectedIds: (val: string[]) => void
  /**
   * Store all items IDs for selection all action in header
   */
  setAllItems: (val: string[]) => void
  /**
   * Open Item actions
   */
  openActionsMenu: (item: CipherAppView) => void
}

/**
 * Describe your component here
 */
export const CipherList = observer(
  ({
    safeBottom,
    ListEmptyComponent,
    isdeleted = false,
    cipherTypes,
    sort,
    folderId,
    collectionId,
    organizationId,
    isSelecting,
    setIsSelecting,
    selectedIds,
    setSelectedIds,
    setAllItems,
    openActionsMenu,
  }: CipherListProps) => {
    const { cipherStore } = useStores()
    const { colors } = useTheme()
    const { translate } = useAppLocale()
    const { notifyTx } = useToast()
    const { getCiphersFromCache } = useCipherData()

    // ------------------------ PARAMS ----------------------------

    const [searchText, setSearchText] = useState("")

    const [ciphers, setCiphers] = useState<CipherAppView[]>([])

    const [isLoadingDone, setIsLoadingDone] = useState(false)

    // ------------------------ COMPUTED ----------------------------
    const data = useMemo(() => {
      const checkSharedEditRow = (c: CipherAppView) => {
        if (!c.organizationId) return true
        const shareRole = getTeam(cipherStore.organizations, c.organizationId).type

        const isShared = shareRole === AccountRole.MEMBER || shareRole === AccountRole.ADMIN
        return !isShared
      }

      if (isSelecting) {
        return ciphers.filter(checkSharedEditRow)
      }
      return ciphers
    }, [ciphers, cipherStore.organizations, isSelecting])

    const masterPassword =
      data.length === 1 && data[0].type === CipherType.MasterPassword ? data[0] : null
    const otherData = masterPassword ? [] : data

    const lastSync = cipherStore.lastSync
    const lastCacheUpdate = cipherStore.lastCacheUpdate
    const notSynchedCiphers = cipherStore.notSynchedCiphers

    // ------------------------ METHODS ----------------------------

    // check if cipher is shared from other user
    // if true, show shared icon
    const isShared = (organizationId: string) => {
      const share = cipherStore.myShares.find((s) => s.id === organizationId)
      if (share) {
        return share.members.length > 0 || share.groups.length > 0
      }
      return !!organizationId
    }

    // Check if cipher is not synced or updated
    const isSync = (id: string) => {
      return [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(id)
    }

    // Get ciphers list
    const loadData = async () => {
      // filter
      const filters = [(c: CipherView) => cipherTypes.includes(c.type)]

      // folder
      if (!folderId && folderId !== undefined) {
        filters.push((c: CipherView) => c.folderId === folderId)
      }

      // collection
      if (!collectionId && collectionId !== undefined) {
        filters.push((c: CipherView) => c.collectionIds.includes(collectionId))
      }

      // organization
      if (!organizationId && organizationId !== undefined) {
        filters.push((c: CipherView) => c.organizationId === organizationId)
      }

      // Search
      const searchRes = await getCiphersFromCache({
        filters,
        searchText,
        deleted: isdeleted,
      })

      if (searchRes.length === 0) {
        setCiphers([])
        setAllItems([])
        setIsLoadingDone(true)
        return
      }

      // Add image
      let res: CipherAppView[] = searchRes.map((c: CipherView) => {
        const cipherLogo = getCipherLogo(c)
        const data = {
          ...c,
          imgLogo: cipherLogo,
          notSync: isSync(c.id),
          isDeleted: c.isDeleted,
        }
        return data
      })

      // Sort
      if (sort) {
        const { orderField, order } = sort
        res =
          orderBy(
            res,
            [
              (c: CipherAppView) =>
                orderField === "name" ? c.name && c.name.toLowerCase() : c.revisionDate,
            ],
            [order],
          ) || []
      }

      setCiphers(res)
      setAllItems(res.map((c) => c.id))
      setIsLoadingDone(true)
    }

    // Toggle item selection
    const toggleItemSelection = (id: string) => {
      if (!isSelecting) {
        setIsSelecting(true)
      }
      let selected = [...selectedIds]
      if (!selected.includes(id)) {
        if (selected.length === MAX_CIPHER_SELECTION) {
          notifyTx("error", "error.cannot_select_more", { count: MAX_CIPHER_SELECTION })
          return
        }
        selected.push(id)
      } else {
        selected = selected.filter((i) => i !== id)
      }
      setSelectedIds(selected)
    }

    // ------------------------ EFFECTS ----------------------------

    useEffect(() => {
      const timeOut = setTimeout(() => {
        loadData()
      }, 150)
      return () => clearTimeout(timeOut)
    }, [searchText, lastSync, lastCacheUpdate, sort, notSynchedCiphers])

    // ------------------------ RENDER ----------------------------

    const renderEmptyComponents = useCallback(() => {
      if (!isLoadingDone) return null

      if (ListEmptyComponent && !searchText.trim()) {
        return ListEmptyComponent
      }
      return (
        <View style={styles.ph16}>
          {searchText ? (
            <Text
              text={translate("error.no_results_found") + ` '${searchText}'`}
              style={styles.centerText}
            />
          ) : (
            <ActivityIndicator size={30} color={colors.title} />
          )}
        </View>
      )
    }, [isLoadingDone, searchText])

    const itemDivider = useCallback(() => {
      return <View style={[styles.divider, { backgroundColor: colors.border }]} />
    }, [])

    return (
      <View style={styles.flex}>
        <FlatList
          removeClippedSubviews
          data={otherData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            return (
              <CipherListItem
                item={item}
                isSelecting={isSelecting}
                toggleItemSelection={toggleItemSelection}
                openActionMenu={openActionsMenu}
                isSelected={selectedIds.includes(item.id)}
                isShared={isShared(item.organizationId)}
              />
            )
          }}
          ListHeaderComponent={
            <>
              <SearchBar
                containerStyle={styles.searchContainer}
                onChangeText={setSearchText}
                value={searchText}
              />
              {masterPassword && (
                <CipherListItem
                  item={masterPassword}
                  isSelecting={false}
                  toggleItemSelection={toggleItemSelection}
                  openActionMenu={openActionsMenu}
                  isSelected={false}
                  isShared={false}
                />
              )}
            </>
          }
          contentContainerStyle={{
            paddingBottom: safeBottom ? StaticSafeAreaInsets.safeAreaInsetsBottom : 0,
          }}
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
  },
)

const styles = StyleSheet.create({
  centerText: {
    textAlign: "center",
  },
  divider: {
    height: 1,
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
