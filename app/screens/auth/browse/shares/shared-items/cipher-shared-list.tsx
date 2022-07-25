import React, { useState, useEffect } from "react"
import { View, FlatList, SectionList } from "react-native"
import { observer } from "mobx-react-lite"
import orderBy from 'lodash/orderBy'
import { Text } from "../../../../../components/text/text"
import { CipherType } from "../../../../../../core/enums"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { CipherView } from "../../../../../../core/models/view"
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data"
import { AccountRole, AccountRoleText } from "../../../../../config/types"
import { Organization } from "../../../../../../core/models/domain/organization"
import { PasswordAction } from "../../passwords/password-action"
import { CardAction } from "../../cards/card-action"
import { NoteAction } from "../../notes/note-action"
import { IdentityAction } from "../../identities/identity-action"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"
import { PendingSharedAction } from "./pending-shared-action"
import { CryptoWalletAction } from "../../crypto-asset/crypto-wallet-action"
import { CipherSharedListItem, CipherSharedType } from "./cipher-shared-list-item"
import { MAX_CIPHER_SELECTION } from "../../../../../config/constants"
import { CollectionListItem } from "../share-items/folder-share-list-item"
import { CollectionView } from "../../../../../../core/models/view/collectionView"
import { FolderAction } from "../../folders/folder-action"


export interface CipherSharedListProps {
  emptyContent?: JSX.Element
  navigation: any
  searchText?: string
  onLoadingChange?: Function
  sortList?: {
    orderField: string
    order: string
  },
  isSelecting: boolean
  setIsSelecting: Function
  selectedItems: string[]
  setSelectedItems: Function
  setAllItems: Function
}

/**
 * Describe your component here
 */
export const CipherSharedList = observer((props: CipherSharedListProps) => {
  const {
    emptyContent, navigation, onLoadingChange, searchText, sortList,
    isSelecting, setIsSelecting, selectedItems, setSelectedItems, setAllItems
  } = props
  const { translate, notify, getTeam } = useMixins()
  const { getCiphersFromCache } = useCipherDataMixins()
  const { cipherStore, collectionStore, user } = useStores()
  const { newCipher, getCipherInfo } = useCipherHelpersMixins()

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

  const pendingCiphers = cipherStore.sharingInvitations.map(i => {
    const cipher: CipherSharedType = newCipher(i.cipher_type)
    const cipherInfo = getCipherInfo(cipher)

    cipher.isShared = true
    cipher.id = i.id
    cipher.organizationId = i.team.id
    cipher.name = `(${translate('shares.encrypted_content')})`
    cipher.logo = cipherInfo.backup
    cipher.svg = cipherInfo.svg

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



  const sharedCollection = collectionStore.collections.filter(i => {
    // Computed
    const teamRole = getTeam(user.teams, i.organizationId).role
    const shareRole = getTeam(organizations, i.organizationId).type
    const isMember = !i.organizationId
      || (teamRole && teamRole !== AccountRoleText.OWNER)
      || (shareRole === AccountRole.ADMIN || shareRole === AccountRole.MEMBER)
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
    const filters = [(c: CipherView) => {
      if (!c.organizationId) {
        return false
      }
      const org = _getOrg(c.organizationId)
      return org && org.type !== AccountRole.OWNER
    }]

    // Search
    const searchRes = await getCiphersFromCache({
      filters,
      searchText,
      deleted: false
    })

    // Add image + org info
    let res = searchRes.map((c: CipherView) => {
      const cipherInfo = getCipherInfo(c)
      const data = {
        ...c,
        logo: cipherInfo.backup,
        imgLogo: cipherInfo.img,
        svg: cipherInfo.svg,
        notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(c.id)
      }
      return data
    })

    // Sort
    if (sortList) {
      const { orderField, order } = sortList
      res = orderBy(
        res,
        [c => orderField === 'name' ? (c.name && c.name.toLowerCase()) : c.revisionDate],
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
    setAllItems(res.map(c => c.id))
  }

  // Handle action menu open
  const openActionMenu = (item: CipherSharedType) => {
    cipherStore.setSelectedCipher(item)
    if (item.isShared) {
      setShowPendingAction(true)
      return
    }
    switch (item.type) {
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
        return
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
      selected = selected.filter(i => i !== id)
    }
    setSelectedItems(selected)
  }

  const DATA = [
    {
      type: 2,
      data: [...sharedCollection]
    },
    {
      type: 1,
      data: [...allCiphers.filter(c => !c.collectionIds?.length)]
    }
  ];

  // ------------------------ RENDER ----------------------------

  return allCiphers.length ? (
    <View style={{ flex: 1 }}>
      {/* Action menus */}

      <PasswordAction
        isOpen={showPasswordAction}
        onClose={() => setShowPasswordAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
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
        onLoadingChange={onLoadingChange}
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
      {/* Action menus end */}


      <SectionList
        style={{
          paddingHorizontal: 20,
        }}
        sections={DATA || []}
        keyExtractor={(item, index) => String(index)}
        renderItem={({ item, index, section }) => (
          <View>
            {
              section.type === 1 && (
                <CipherSharedListItem
                  item={item}
                  isSelecting={isSelecting}
                  toggleItemSelection={setCheckedItem}
                  openActionMenu={openActionMenu}
                  isSelected={selectedItems.includes(item.id)}
                  org={_getOrg(item)}
                />
              )
            }
            {
              section.type === 2 && (
                <CollectionListItem
                  item={item}
                  openActionMenu={openCollectionActionMenu}
                  navigation={navigation}
                />
              )
            }
          </View>
        )}
      />

    </View>
  ) : (
    emptyContent && !searchText.trim() ? (
      <View style={{ paddingHorizontal: 20 }}>
        {emptyContent}
      </View>
    ) : (
      <View style={{ paddingHorizontal: 20 }}>
        <Text
          text={translate('error.no_results_found') + ` '${searchText}'`}
          style={{
            textAlign: 'center'
          }}
        />
      </View>
    )
  )
})
