import React, { useState, useEffect } from "react"
import { View, FlatList } from "react-native"
import { observer } from "mobx-react-lite"
import orderBy from 'lodash/orderBy'
import { Text } from "../../../../../../components"
import { useMixins } from "../../../../../../services/mixins"
import { useCipherDataMixins } from "../../../../../../services/mixins/cipher/data"
import { useCipherHelpersMixins } from "../../../../../../services/mixins/cipher/helpers"
import { useStores } from "../../../../../../models"
import { CipherView } from "../../../../../../../core/models/view"
import { CipherType } from "../../../../../../../core/enums"
import { CipherListItem } from "../../../../../../components/cipher/cipher-list/cipher-list-item"
import { PasswordAction } from "../../../../browse/passwords/password-action"
import { CardAction } from "../../../../browse/cards/card-action"
import { IdentityAction } from "../../../../browse/identities/identity-action"
import { NoteAction } from "../../../../browse/notes/note-action"
import { CryptoWalletAction } from "../../../../browse/crypto-asset/crypto-wallet-action"
import { DeletedAction } from "../../../../../../components/cipher/cipher-action/deleted-action"


export interface CipherListProps {
  emptyContent?: JSX.Element
  navigation: any
  searchText?: string
  onLoadingChange?: Function
  sortList?: {
    orderField: string
    order: string
  },
}

/**
 * Describe your component here
 */
export const CipherList = observer((props: CipherListProps) => {
  const {
    emptyContent, navigation, onLoadingChange, searchText, sortList,
  } = props
  const { translate, getTeam, notify } = useMixins()
  const { getCiphersFromCache } = useCipherDataMixins()
  const { getCipherInfo } = useCipherHelpersMixins()
  const { cipherStore, user } = useStores()

  // ------------------------ PARAMS ----------------------------

  const [showPasswordAction, setShowPasswordAction] = useState(false)
  const [showNoteAction, setShowNoteAction] = useState(false)
  const [showIdentityAction, setShowIdentityAction] = useState(false)
  const [showCardAction, setShowCardAction] = useState(false)
  const [showCryptoWalletAction, setShowCryptoWalletAction] = useState(false)
  const [showDeletedAction, setShowDeletedAction] = useState(false)
  const [ciphers, setCiphers] = useState([])

  const [checkedItem, setCheckedItem] = useState('')

  // ------------------------ COMPUTED ----------------------------

  const isShared = (organizationId: string) => {
    const share = cipherStore.myShares.find(s => s.id === organizationId)
    if (share) {
      return share.members.length > 0
    }
    return !!organizationId
  }

  // ------------------------ EFFECTS ----------------------------

  useEffect(() => {

    loadData()
  }, [searchText, cipherStore.lastSync, cipherStore.lastCacheUpdate, sortList])

  useEffect(() => {
    if (checkedItem) {
      setCheckedItem(null)
    }
  }, [checkedItem])

  // ------------------------ METHODS ----------------------------

  // Get ciphers list
  const loadData = async () => {
    // onLoadingChange && onLoadingChange(true)
    // const t = new DurationTest("load")
    // Filter


    // Search
    // const searchRes = await getCiphersFromCache({
    //   filters,
    //   searchText,
    //   deleted
    // })

    // // Add image
    // let res = searchRes.map((c: CipherView) => {
    //   const cipherInfo = getCipherInfo(c)
    //   const data = {
    //     ...c,
    //     logo: cipherInfo.backup,
    //     imgLogo: cipherInfo.img,
    //     svg: cipherInfo.svg,
    //     notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(c.id),
    //     isDeleted: c.isDeleted
    //   }
    //   return data
    // })


    // // Filter
    // if (folderId !== undefined) {
    //   res = res.filter(i => i.folderId === folderId)
    // }

    // // collection
    // if (collectionId !== undefined) {
    //   if (collectionId !== null) {
    //     res = res.filter(i => i.collectionIds.includes(collectionId))
    //   }
    // }

    // if (organizationId === undefined && collectionId == undefined && folderId === null) {
    //   res = res.filter(i => !getTeam(user.teams, i.organizationId).name)
    //   res = res.filter(i => !i.collectionIds.length)
    // }
    // if (organizationId !== undefined) {
    //   if (organizationId === null) {
    //     res = res.filter(i => !!i.organizationId)
    //   } else {
    //     res = res.filter(i => i.organizationId === organizationId)
    //   }
    // }

    // // Sort
    // if (sortList) {
    //   const { orderField, order } = sortList
    //   res = orderBy(
    //     res,
    //     [c => orderField === 'name' ? (c.name && c.name.toLowerCase()) : c.revisionDate],
    //     [order]
    //   ) || []
    // }

    // // Delay loading
    // setTimeout(() => {
    //   onLoadingChange && onLoadingChange(false)
    // }, 50)
    // // t.final()
    // // Done
    // setCiphers(res)
    // setAllItems(res.map(c => c.id))
  }


  // Handle action menu open
  const openActionMenu = (item: CipherView) => {
    cipherStore.setSelectedCipher(item)

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

  // Go to detail
  // const goToDetail = (item: CipherView) => {
  //   cipherStore.setSelectedCipher(item)
  //   const cipherInfo = getCipherInfo(item)
  //   navigation.navigate(`${cipherInfo.path}__info`)
  // }

  // ------------------------ RENDER ----------------------------

  const renderItem = ({ item }) => {
    return (
      <CipherListItem
        item={item}
        isSelecting={false}
        toggleItemSelection={setCheckedItem}
        openActionMenu={openActionMenu}
        isSelected={false}
        isShared={false}
      />
    )
  }

  return ciphers.length ? (
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

      <DeletedAction
        isOpen={showDeletedAction}
        onClose={() => setShowDeletedAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
      />

      {/* Action menus end */}

      {/* Cipher list */}
      <FlatList
        style={{
          paddingHorizontal: 20,
        }}
        data={ciphers}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        getItemLayout={(data, index) => ({
          length: 71,
          offset: 71 * index,
          index
        })}
      />
      {/* Cipher list end */}
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
