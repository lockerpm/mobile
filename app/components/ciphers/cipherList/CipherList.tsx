import orderBy from 'lodash/orderBy'
import React, { useState, useEffect, useCallback } from 'react'
import { View, FlatList, ActivityIndicator } from 'react-native'
import { useStores } from 'app/models'
import { useTheme } from 'app/services/context'
import { useCipherData, useCipherHelper, useHelper } from 'app/services/hook'
import { MAX_CIPHER_SELECTION } from 'app/static/constants'
import { CipherAppView } from 'app/static/types'
import { CipherType } from 'core/enums'
import { CipherView } from 'core/models/view'

import { CipherListItem } from './CipherListItem'
import { Text } from '../../cores'
import { PasswordAction } from 'app/screens/auth/browse/passwords/PasswordAction'
import { CardAction } from 'app/screens/auth/browse/cards/CardAction'
import { IdentityAction } from 'app/screens/auth/browse/identities/IdentityAction'
import { NoteAction } from 'app/screens/auth/browse/notes/NoteAction'
import { CryptoWalletAction } from 'app/screens/auth/browse/cryptoAsset/CryptoWalletAction'
import { DeletedAction } from '../cipherAction/DeletedAction'
import { observer } from 'mobx-react-lite'

export interface CipherListProps {
  navigation: any

  emptyContent?: JSX.Element
  searchText?: string
  onLoadingChange?: (val: boolean) => void
  cipherType?: CipherType | CipherType[]
  deleted?: boolean
  sortList?: {
    orderField: string
    order: string
  }
  folderId?: string
  collectionId?: string
  organizationId?: string
  isSelecting: boolean
  setIsSelecting: (val: boolean) => void
  selectedItems: string[]
  setSelectedItems: (val: any) => void
  setAllItems: (val: any) => void
}

/**
 * Describe your component here
 */
export const CipherList = observer((props: CipherListProps) => {
  const { cipherStore, user } = useStores()

  const {
    emptyContent,
    onLoadingChange,
    searchText,
    navigation,
    deleted = false,
    sortList,
    folderId,
    collectionId,
    organizationId,
    isSelecting,
    setIsSelecting,
    selectedItems,
    setSelectedItems,
    setAllItems,
  } = props
  const { colors } = useTheme()
  const { getTeam, notify, translate } = useHelper()
  const { getCiphersFromCache } = useCipherData()
  const { getCipherInfo } = useCipherHelper()

  // ------------------------ PARAMS ----------------------------

  const [showPasswordAction, setShowPasswordAction] = useState(false)
  const [showNoteAction, setShowNoteAction] = useState(false)
  const [showIdentityAction, setShowIdentityAction] = useState(false)
  const [showCardAction, setShowCardAction] = useState(false)
  const [showCryptoWalletAction, setShowCryptoWalletAction] = useState(false)
  const [showDeletedAction, setShowDeletedAction] = useState(false)

  const [ciphers, setCiphers] = useState<CipherAppView[]>([])

  const [checkedItem, setCheckedItem] = useState('')

  const [isSearching, setIsSearching] = useState(true)

  const [isLoadingDone, setIsLoadingDone] = useState(false)

  // ------------------------ METHODS ----------------------------

  const isShared = (organizationId: string) => {
    const share = cipherStore.myShares.find((s) => s.id === organizationId)
    if (share) {
      return share.members.length > 0 || share.groups.length > 0
    }
    return !!organizationId
  }

  // Get ciphers list
  const loadData = async () => {
    // onLoadingChange && onLoadingChange(true)
    // Filter
    const filters = []
    if (props.cipherType) {
      if (typeof props.cipherType === 'number') {
        filters.push((c: CipherView) => c.type === props.cipherType)
      } else {
        // @ts-ignore
        filters.push((c: CipherView) => props.cipherType.includes(c.type))
      }
    }

    // Search
    const searchRes = await getCiphersFromCache({
      filters,
      searchText,
      deleted,
    })

    if (searchRes.length === 0) {
      setCiphers([])
      setAllItems([])
      setIsLoadingDone(() => true)
      return
    }

    // Add image
    let res: CipherAppView[] = searchRes.map((c: CipherView) => {
      const cipherInfo = getCipherInfo(c)
      const data = {
        ...c,
        imgLogo: cipherInfo.img,
        notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
          c.id
        ),
        isDeleted: c.isDeleted,
      }
      return data
    })

    // Filter
    if (folderId !== undefined) {
      res = res.filter((i) => i.folderId === folderId)
    }

    // collection
    if (collectionId !== undefined) {
      if (collectionId !== null) {
        res = res.filter((i) => i.collectionIds.includes(collectionId))
      }
    }

    if (organizationId === undefined && collectionId === undefined && folderId === null) {
      res = res.filter((i) => !getTeam(user.teams, i.organizationId).name)
      res = res.filter((i) => !i.collectionIds.length)
    }
    if (organizationId !== undefined) {
      if (organizationId === null) {
        res = res.filter((i) => !!i.organizationId)
      } else {
        res = res.filter((i) => i.organizationId === organizationId)
      }
    }

    // Sort
    if (sortList) {
      const { orderField, order } = sortList
      res =
        orderBy(
          res,
          [(c) => (orderField === 'name' ? c.name && c.name.toLowerCase() : c.revisionDate)],
          [order]
        ) || []
    }

    // Delay loading
    setTimeout(() => {
      onLoadingChange && onLoadingChange(false)
    }, 100)
    // t.final()
    // Done
    setCiphers(res)
    setAllItems(res.map((c) => c.id))
    setIsLoadingDone(() => true)
  }

  // Handle action menu open
  const openActionMenu = (item: CipherView) => {
    cipherStore.setSelectedCipher(item)
    if (deleted) {
      setShowDeletedAction(true)
      return
    }

    switch (item.type) {
      case CipherType.MasterPassword:
      case CipherType.Login:
        setShowPasswordAction(true)
        break
      case CipherType.Card:
        setShowCardAction(true)
        break
      case CipherType.Identity:
        setShowIdentityAction(true)
        break
      case CipherType.SecureNote:
        setShowNoteAction(true)
        break
      case CipherType.CryptoWallet:
        setShowCryptoWalletAction(true)
        break
      default:
        break
    }
  }

  // Go to detail
  // const goToDetail = (item: CipherView) => {
  //   cipherStore.setSelectedCipher(item)
  //   const cipherInfo = getCipherInfo(item)
  //   navigation.navigate(`${cipherInfo.path}__info`)
  // }

  // Toggle item selection
  const toggleItemSelection = (id: string) => {
    if (!isSelecting) {
      setIsSelecting(true)
    }
    let selected = [...selectedItems]
    if (!selected.includes(id)) {
      if (selected.length === MAX_CIPHER_SELECTION) {
        notify('error', translate('error.cannot_select_more', { count: MAX_CIPHER_SELECTION }))
        return
      }
      selected.push(id)
    } else {
      selected = selected.filter((i) => i !== id)
    }
    setSelectedItems(selected)
  }

  // ------------------------ EFFECTS ----------------------------

  const lastSync = cipherStore.lastSync
  const lastCacheUpdate = cipherStore.lastCacheUpdate

  useEffect(() => {
    if (searchText) setIsSearching(true)
    if (!searchText && isSearching) {
      setIsSearching(false)
    }

    loadData()
  }, [searchText, lastSync, lastCacheUpdate, sortList])

  useEffect(() => {
    if (checkedItem) {
      toggleItemSelection(checkedItem)
      setCheckedItem(null)
    }
  }, [checkedItem, selectedItems])

  // ------------------------ RENDER ----------------------------

  const renderEmptyComponents = useCallback(() => {
    if (!isLoadingDone) return null

    if (emptyContent && !searchText.trim() && !isSearching) {
      return <View style={{ paddingHorizontal: 20 }}>{emptyContent}</View>
    }
    return (
      <View style={{ paddingHorizontal: 20 }}>
        {searchText ? (
          <Text
            text={translate('error.no_results_found') + ` '${searchText}'`}
            style={{
              textAlign: 'center',
            }}
          />
        ) : (
          <ActivityIndicator size={30} color={colors.title} />
        )}
      </View>
    )
  }, [isLoadingDone, searchText, isSearching])

  const renderItem = ({ item }) => {
    return (
      <CipherListItem
        item={item}
        isSelecting={isSelecting}
        toggleItemSelection={setCheckedItem}
        openActionMenu={openActionMenu}
        isSelected={selectedItems.includes(item.id)}
        isShared={isShared(item.organizationId)}
      />
    )
  }
  return (
    <View style={{ flex: 1 }}>
      <PasswordAction
        isOpen={showPasswordAction}
        onClose={() => setShowPasswordAction(false)}
        navigation={navigation}
      />

      <CardAction
        isOpen={showCardAction}
        onClose={() => setShowCardAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
      />

      <IdentityAction
        isOpen={showIdentityAction}
        onClose={() => setShowIdentityAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
      />

      <NoteAction
        isOpen={showNoteAction}
        onClose={() => setShowNoteAction(false)}
        navigation={navigation}
      />

      <CryptoWalletAction
        isOpen={showCryptoWalletAction}
        onClose={() => setShowCryptoWalletAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
      />

      <DeletedAction
        isOpen={showDeletedAction}
        onClose={() => setShowDeletedAction(false)}
        navigation={navigation}
      />

      <FlatList
        data={ciphers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        removeClippedSubviews
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
