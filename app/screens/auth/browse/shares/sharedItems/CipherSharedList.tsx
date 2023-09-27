/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import { View, SectionList } from 'react-native'
import { observer } from 'mobx-react-lite'
import orderBy from 'lodash/orderBy'

import { PasswordAction } from '../../passwords/PasswordAction'
import { CardAction } from '../../cards/CardAction'
import { NoteAction } from '../../notes/NoteAction'
import { IdentityAction } from '../../identities/IdentityAction'
import { PendingSharedAction } from './PendingSharedAction'
import { CryptoWalletAction } from '../../cryptoAsset/CryptoWalletAction'
import { CipherSharedListItem, CipherSharedType } from './CipherSharedListItem'
import { CollectionListItem } from '../shareItems/FolderShareListItem'
import { FolderAction } from '../../folders/FolderAction'
import { useCipherData, useCipherHelper, useHelper } from 'app/services/hook'
import { useStores } from 'app/models'
import { CollectionView } from 'core/models/view/collectionView'
import { translate } from 'app/i18n'
import { AccountRole, AccountRoleText } from 'app/static/types'
import { Organization } from 'core/models/domain/organization'
import { CipherView } from 'core/models/view'
import { CipherType } from 'core/enums'
import { MAX_CIPHER_SELECTION } from 'app/static/constants'
import { Text } from 'app/components/cores'

export interface CipherSharedListProps {
  emptyContent?: JSX.Element
  navigation: any
  searchText?: string
  onLoadingChange?: (val: boolean) => void
  sortList?: {
    orderField: string
    order: string
  }
  isSelecting: boolean
  setIsSelecting: (val: boolean) => void
  selectedItems: string[]
  setSelectedItems: (val: any) => void
  setAllItems: (val: any) => void
}

/**
 * Describe your component here
 */
export const CipherSharedList = observer((props: CipherSharedListProps) => {
  const {
    emptyContent,
    navigation,
    onLoadingChange,
    searchText,
    sortList,
    isSelecting,
    setIsSelecting,
    selectedItems,
    setSelectedItems,
    setAllItems,
  } = props
  const { notify, getTeam } = useHelper()
  const { getCiphersFromCache } = useCipherData()
  const { cipherStore, collectionStore, user } = useStores()
  const { newCipher, getCipherInfo } = useCipherHelper()

  // ------------------------ PARAMS ----------------------------

  const [showCollectionAction, setShowCollectionAction] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<CollectionView>(null)

  const [ciphers, setCiphers] = useState<CipherSharedType[]>([])
  const [showPasswordAction, setShowPasswordAction] = useState(false)
  const [showNoteAction, setShowNoteAction] = useState(false)
  const [showIdentityAction, setShowIdentityAction] = useState(false)
  const [showCardAction, setShowCardAction] = useState(false)
  const [showCryptoWalletAction, setShowCryptoWalletAction] = useState(false)
  const [showPendingAction, setShowPendingAction] = useState(false)

  const [checkedItem, setCheckedItem] = useState('')

  // ------------------------ COMPUTED ----------------------------

  const organizations = cipherStore.organizations

  const pendingCiphers = cipherStore.sharingInvitations.map((i) => {
    const cipher: CipherSharedType = newCipher(i.cipher_type)
    const cipherInfo = getCipherInfo(cipher)

    cipher.isShared = true
    cipher.id = i.id
    cipher.organizationId = i.team.id
    cipher.name = `(${translate('shares.encrypted_content')})`
    cipher.imgLogo = cipherInfo.img

    let shareType = ''
    if (i.role === AccountRoleText.MEMBER) {
      // if (i.hide_passwords) {
      //   shareType = translate('shares.share_type.only_fill')
      // } else {
      //   shareType = translate('shares.share_type.view')
      // }
      shareType = translate('shares.share_type.view')
    }
    if (i.role === AccountRoleText.ADMIN) {
      shareType = translate('shares.share_type.edit')
    }
    cipher.description = `${i.team.name} - ${shareType}`
    return cipher
  })

  const allCiphers = !!searchText.trim() || isSelecting ? ciphers : [...pendingCiphers, ...ciphers]

  const sharedCollection = collectionStore.collections.filter((i) => {
    // Computed
    const teamRole = getTeam(user.teams, i.organizationId).role
    const shareRole = getTeam(organizations, i.organizationId).type
    const isMember =
      !i.organizationId ||
      (teamRole && teamRole !== AccountRoleText.OWNER) ||
      shareRole === AccountRole.ADMIN ||
      shareRole === AccountRole.MEMBER
    return isMember && i.name?.includes(searchText.toLowerCase())
  })

  // ------------------------ EFFECTS ----------------------------

  useEffect(() => {
    loadData()
  }, [searchText, cipherStore.lastSync, cipherStore.lastCacheUpdate, sortList])

  useEffect(() => {
    if (checkedItem) {
      toggleItemSelection(checkedItem)
      setCheckedItem(null)
    }
  }, [checkedItem, selectedItems])

  // ------------------------ METHODS ----------------------------

  const _getOrg = (id: string) => {
    return organizations.find((o: Organization) => o.id === id)
  }

  // Get ciphers list
  const loadData = async () => {
    // onLoadingChange && onLoadingChange(true)

    // Filter
    const filters = [
      (c: CipherView) => {
        if (!c.organizationId) {
          return false
        }
        const org = _getOrg(c.organizationId)
        return org && org.type !== 0
      },
    ]

    // Search
    const searchRes = await getCiphersFromCache({
      filters,
      searchText,
      deleted: false,
    })

    // Add image + org info
    let res = searchRes.map((c: CipherView) => {
      const cipherInfo = getCipherInfo(c)
      const data = {
        ...c,
        imgLogo: cipherInfo.img,
        notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
          c.id
        ),
      }
      return data
    })

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

    // Done
    // @ts-ignore
    setCiphers(res)
    setAllItems(res.map((c) => c.id))
  }

  // Handle action menu open
  const openActionMenu = (item: CipherSharedType) => {
    cipherStore.setSelectedCipher(item)
    if (item.isShared) {
      setShowPendingAction(true)
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
    }
  }

  // Handle open collection menu
  const openCollectionActionMenu = (item: CollectionView) => {
    setSelectedCollection(item)
    setShowCollectionAction(true)
  }

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

  const DATA = [
    {
      type: 2,
      data: [...sharedCollection],
    },
    {
      type: 1,
      data: [...allCiphers.filter((c) => !c.collectionIds?.length)],
    },
  ]

  // ------------------------ RENDER ----------------------------

  return allCiphers.length ? (
    <View style={{ flex: 1 }}>
      {/* Action menus */}

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

      <PendingSharedAction
        isOpen={showPendingAction}
        onClose={() => setShowPendingAction(false)}
        onLoadingChange={onLoadingChange}
      />

      <FolderAction
        isOpen={showCollectionAction}
        onClose={() => setShowCollectionAction(false)}
        onLoadingChange={onLoadingChange}
        folder={selectedCollection}
      />

      <SectionList
        style={{
          paddingHorizontal: 20,
        }}
        sections={DATA || []}
        keyExtractor={(item, index) => String(index)}
        renderItem={({ item, index, section }) => (
          <View>
            {section.type === 1 && (
              <CipherSharedListItem
                item={item}
                isSelecting={isSelecting}
                toggleItemSelection={setCheckedItem}
                openActionMenu={openActionMenu}
                isSelected={selectedItems.includes(item.id)}
                // @ts-ignore
                org={_getOrg(item)}
              />
            )}
            {section.type === 2 && (
              <CollectionListItem
                item={item}
                openActionMenu={openCollectionActionMenu}
                navigation={navigation}
              />
            )}
          </View>
        )}
      />
    </View>
  ) : emptyContent && !searchText.trim() ? (
    <View style={{ paddingHorizontal: 20 }}>{emptyContent}</View>
  ) : (
    <View style={{ paddingHorizontal: 20 }}>
      <Text
        preset="label"
        text={translate('error.no_results_found') + ` '${searchText}'`}
        style={{
          textAlign: 'center',
        }}
      />
    </View>
  )
})
