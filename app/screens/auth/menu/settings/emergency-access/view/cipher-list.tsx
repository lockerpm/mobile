import React, { useState, useEffect } from "react"
import { View, FlatList } from "react-native"
import { observer } from "mobx-react-lite"
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
import { DriverLicenseAction } from "../../../../browse/driver-license/driver-license-action"
import { CitizenIDAction } from "../../../../browse/citizen-id/citizen-id-action"
import { PassportAction } from "../../../../browse/passport/passport-action"
import { SocialSecurityNumberAction } from "../../../../browse/social-security-number/social-security-number-action"
import { WirelessRouterAction } from "../../../../browse/wireless-router/wireless-router-action"
import { ServerAction } from "../../../../browse/server/server-action"
import { ApiCipherAction } from "../../../../browse/api-cipher/api-cipher-action"
import { DatabaseAction } from "../../../../browse/database/database-action"


export interface CipherListProps {
  ciphers: any[]
  emptyContent?: JSX.Element
  navigation: any
  searchText?: string
  onLoadingChange?: (val: boolean) => void
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

  const [showDriverLicenseAction, setShowDriverLicenseAction] = useState(false)
  const [showCitizenIDAction, setShowCitizenIDAction] = useState(false)
  const [showPassportAction, setShowPassportAction] = useState(false)
  const [showSocialNumberAction, setShowSocialNumberAction] = useState(false)
  const [showWirelessRouterAction, setShowWirelessRouterAction] = useState(false)
  const [showServerAction, setShowServerAction] = useState(false)
  const [showApiAction, setShowApiAction] = useState(false)
  const [showDataBaseAction, setShowDatabaseAction] = useState(false)

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
        case CipherType.DriverLicense:
        setShowDriverLicenseAction(true)
        break
      case CipherType.CitizenID:
        setShowCitizenIDAction(true)
        break
      case CipherType.Passport:
        setShowPassportAction(true)
        break
      case CipherType.SocialSecurityNumber:
        setShowSocialNumberAction(true)
        break
      case CipherType.WirelessRouter:
        setShowWirelessRouterAction(true)
        break
      case CipherType.Server:
        setShowWirelessRouterAction(true)
        break
      case CipherType.APICipher:
        setShowApiAction(true)
        break
      case CipherType.Database:
        setShowDatabaseAction(true)
        break
      default:
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
        isEmergencyView={true}
      />

      <CardAction
        isOpen={showCardAction}
        onClose={() => setShowCardAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
        isEmergencyView={true}
      />

      <IdentityAction
        isOpen={showIdentityAction}
        onClose={() => setShowIdentityAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
        isEmergencyView={true}
      />

      <NoteAction
        isOpen={showNoteAction}
        onClose={() => setShowNoteAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
        isEmergencyView={true}
      />

      <CryptoWalletAction
        isOpen={showCryptoWalletAction}
        onClose={() => setShowCryptoWalletAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
        isEmergencyView={true}
      />
      
      {/* Other types */}
      <DriverLicenseAction
        isOpen={showDriverLicenseAction}
        onClose={() => setShowDriverLicenseAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
      />

      <CitizenIDAction
        isOpen={showCitizenIDAction}
        onClose={() => setShowCitizenIDAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
      />

      <PassportAction
        isOpen={showPassportAction}
        onClose={() => setShowPassportAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
      />

      <SocialSecurityNumberAction
        isOpen={showSocialNumberAction}
        onClose={() => setShowSocialNumberAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
      />

      <WirelessRouterAction
        isOpen={showWirelessRouterAction}
        onClose={() => setShowWirelessRouterAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
      />

      <ServerAction
        isOpen={showServerAction}
        onClose={() => setShowServerAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
      />

      <ApiCipherAction
        isOpen={showApiAction}
        onClose={() => setShowApiAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
      />

      <DatabaseAction
        isOpen={showDataBaseAction}
        onClose={() => setShowDatabaseAction(false)}
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
    emptyContent && (
      <View style={{ paddingHorizontal: 20 }}>
        {emptyContent}
      </View>
    )
  )
})
