import React, { useState, useEffect } from "react"
import { View, FlatList, ActivityIndicator } from "react-native"
import { observer } from "mobx-react-lite"
import orderBy from "lodash/orderBy"
import { Text } from "../../text/text"
import { CipherType, FieldType } from "../../../../core/enums"
import { useMixins } from "../../../services/mixins"
import { useStores } from "../../../models"
import { CipherView } from "../../../../core/models/view"
import { PasswordAction } from "../../../screens/auth/browse/passwords/password-action"
import { CardAction } from "../../../screens/auth/browse/cards/card-action"
import { IdentityAction } from "../../../screens/auth/browse/identities/identity-action"
import { NoteAction } from "../../../screens/auth/browse/notes/note-action"
import { DeletedAction } from "../cipher-action/deleted-action"
import { useCipherDataMixins } from "../../../services/mixins/cipher/data"
import { CryptoWalletAction } from "../../../screens/auth/browse/crypto-asset/crypto-wallet-action"
import { DriverLicenseAction } from "../../../screens/auth/browse/driver-license/driver-license-action"
import { CitizenIDAction } from "../../../screens/auth/browse/citizen-id/citizen-id-action"
import { PassportAction } from "../../../screens/auth/browse/passport/passport-action"
import { SocialSecurityNumberAction } from "../../../screens/auth/browse/social-security-number/social-security-number-action"
import { ApiCipherAction } from "../../../screens/auth/browse/api-cipher/api-cipher-action"
import { ServerAction } from "../../../screens/auth/browse/server/server-action"
import { DatabaseAction } from "../../../screens/auth/browse/database/database-action"
import { WirelessRouterAction } from "../../../screens/auth/browse/wireless-router/wireless-router-action"
import { useCipherHelpersMixins } from "../../../services/mixins/cipher/helpers"
import { CipherListItem } from "./cipher-list-item"
import { MAX_CIPHER_SELECTION } from "../../../config/constants"
import { Logger } from "../../../utils/utils"

export interface CipherListProps {
  emptyContent?: JSX.Element
  navigation: any
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
  setSelectedItems: Function
  setAllItems: Function
}

/**
 * Describe your component here
 */
export const CipherList = observer((props: CipherListProps) => {
  const {
    emptyContent,
    navigation,
    onLoadingChange,
    searchText,
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
  const { translate, getTeam, notify, color } = useMixins()
  const { getCiphersFromCache, updateCipher } = useCipherDataMixins()
  const { getCipherInfo } = useCipherHelpersMixins()
  const { cipherStore, user } = useStores()

  // ------------------------ PARAMS ----------------------------

  const [showPasswordAction, setShowPasswordAction] = useState(false)
  const [showNoteAction, setShowNoteAction] = useState(false)
  const [showIdentityAction, setShowIdentityAction] = useState(false)
  const [showCardAction, setShowCardAction] = useState(false)
  const [showCryptoWalletAction, setShowCryptoWalletAction] = useState(false)
  const [showDeletedAction, setShowDeletedAction] = useState(false)

  const [showDriverLicenseAction, setShowDriverLicenseAction] = useState(false)
  const [showCitizenIDAction, setShowCitizenIDAction] = useState(false)
  const [showPassportAction, setShowPassportAction] = useState(false)
  const [showSocialNumberAction, setShowSocialNumberAction] = useState(false)
  const [showWirelessRouterAction, setShowWirelessRouterAction] = useState(false)
  const [showServerAction, setShowServerAction] = useState(false)
  const [showApiAction, setShowApiAction] = useState(false)
  const [showDataBaseAction, setShowDatabaseAction] = useState(false)

  const [ciphers, setCiphers] = useState([])

  const [checkedItem, setCheckedItem] = useState("")

  const [isSearching, setIsSearching] = useState(true)
  // ------------------------ COMPUTED ----------------------------

  const isShared = (organizationId: string) => {
    const share = cipherStore.myShares.find((s) => s.id === organizationId)
    if (share) {
      return share.members.length > 0 || share.groups.length > 0
    }
    return !!organizationId
  }

  // ------------------------ EFFECTS ----------------------------

  useEffect(() => {
    loadData()
  }, [searchText, cipherStore.lastSync, cipherStore.lastCacheUpdate, sortList])

  useEffect(() => {
    if (searchText) setIsSearching(true)
    if (!searchText && isSearching) {
      setIsSearching(false)
    }
  }, [searchText])

  useEffect(() => {
    if (checkedItem) {
      toggleItemSelection(checkedItem)
      setCheckedItem(null)
    }
  }, [checkedItem, selectedItems])
  // ------------------------ METHODS ----------------------------

  // Get ciphers list
  const loadData = async () => {
    // onLoadingChange && onLoadingChange(true)
    // Filter
    const filters = []
    if (props.cipherType) {
      if (typeof props.cipherType === "number") {
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

    // Add image
    let res = searchRes.map((c: CipherView) => {
      const cipherInfo = getCipherInfo(c)
      const data = {
        ...c,
        logo: cipherInfo.backup,
        imgLogo: cipherInfo.img,
        svg: cipherInfo.svg,
        notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
          c.id,
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
          [(c) => (orderField === "name" ? c.name && c.name.toLowerCase() : c.revisionDate)],
          [order],
        ) || []
    }

    // if (searchText) {
    //   res.sort((a, b) => a.name.toLocaleLowerCase().includes(searchText.trim().toLocaleLowerCase()) ? -1 : 0)
    // }

    // Delay loading
    setTimeout(() => {
      onLoadingChange && onLoadingChange(false)
    }, 100)
    // t.final()
    // Done
    setCiphers(res)
    setAllItems(res.map((c) => c.id))
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
        break
    }
  }

  // remove new item type (convert exsiting this item type to note)
  const removeItemn = () => {
    const removeItemType = [
      CipherType.DriverLicense,
      CipherType.CitizenID,
      CipherType.Passport,
      CipherType.SocialSecurityNumber,
      CipherType.WirelessRouter,
      CipherType.Server,
      CipherType.APICipher,
      CipherType.Database,
    ]
    ciphers
      .filter((c) => removeItemType.includes(c.type))
      ?.forEach((cipher) => {
        try {
          const content = JSON.parse(cipher.notes)
          cipher.type = CipherType.SecureNote
          cipher.secureNote.type = 0
          cipher.notes = content.notes
          function camelCaseToWords(str) {
            if (!str) {
              return ""
            }
            const newStr = str
              .replace(/([a-z])([A-Z])/g, "$1 $2")
              .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
              .replace(/(\b[A-Z]{2,}\b)(?=[a-z])/g, "$1 ")
              .toLowerCase()
            return newStr ? newStr[0].toUpperCase() + newStr.slice(1) : newStr
          }
          const newFields = Object.keys(content)
            .filter((k) => k !== "notes")
            .map((k) => ({
              name: camelCaseToWords(k),
              value: content[k],
              type: FieldType.Text,
            }))
          cipher.fields = [...(cipher.fields || []), ...newFields]
          updateCipher(cipher.id, cipher, 0, [], true)
        } catch (e) {
          Logger.error(e)
        }
      })
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
        notify("error", translate("error.cannot_select_more", { count: MAX_CIPHER_SELECTION }))
        return
      }
      selected.push(id)
    } else {
      selected = selected.filter((i) => i !== id)
    }
    setSelectedItems(selected)
  }
  // ------------------------ RENDER ----------------------------

  useEffect(() => {
    removeItemn()
  }, [ciphers])

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
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          !!emptyContent && !searchText.trim() && !isSearching ? (
            <View style={{ paddingHorizontal: 20 }}>{emptyContent}</View>
          ) : (
            <View style={{ paddingHorizontal: 20 }}>
              {searchText ? (
                <Text
                  text={translate("error.no_results_found") + ` '${searchText}'`}
                  style={{
                    textAlign: "center",
                  }}
                />
              ) : (
                <ActivityIndicator size={30} color={color.textBlack} />
              )}
            </View>
          )
        }
        getItemLayout={(data, index) => ({
          length: 71,
          offset: 71 * index,
          index,
        })}
      />
      {/* Cipher list end */}
    </View>
  )
})
