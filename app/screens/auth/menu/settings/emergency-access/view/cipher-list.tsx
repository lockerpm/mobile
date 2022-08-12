import React, { useState, useEffect } from "react"
import { View, FlatList } from "react-native"
import { observer } from "mobx-react-lite"
import { Text } from "../../../../../../components"
import { useMixins } from "../../../../../../services/mixins"
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
  ciphers: any[]
  emptyContent?: JSX.Element
  navigation: any
  searchText?: string
  onLoadingChange?: Function
}

/**
 * Describe your component here
 */
export const CipherList = observer((props: CipherListProps) => {
  const {
    emptyContent, navigation, onLoadingChange, searchText, ciphers,
  } = props
  const { translate } = useMixins()
  const { cipherStore } = useStores()

  // ------------------------ PARAMS ----------------------------

  const [showPasswordAction, setShowPasswordAction] = useState(false)
  const [showNoteAction, setShowNoteAction] = useState(false)
  const [showIdentityAction, setShowIdentityAction] = useState(false)
  const [showCardAction, setShowCardAction] = useState(false)
  const [showCryptoWalletAction, setShowCryptoWalletAction] = useState(false)
  const [showDeletedAction, setShowDeletedAction] = useState(false)

  const [checkedItem, setCheckedItem] = useState('')

  // ------------------------ COMPUTED ----------------------------

  // ------------------------ EFFECTS ----------------------------
  useEffect(() => {
    if (checkedItem) {
      setCheckedItem(null)
    }
  }, [checkedItem])

  // ------------------------ METHODS ----------------------------



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
