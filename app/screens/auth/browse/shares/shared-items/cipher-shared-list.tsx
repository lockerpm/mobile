import React, { useState, useEffect } from "react"
import { View, FlatList } from "react-native"
import { observer } from "mobx-react-lite"
import orderBy from 'lodash/orderBy'
import { Button } from "../../../../../components/button/button"
import { Text } from "../../../../../components/text/text"
import { AutoImage as Image } from "../../../../../components/auto-image/auto-image"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { CipherType } from "../../../../../../core/enums"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { CipherView } from "../../../../../../core/models/view"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { commonStyles, fontSize } from "../../../../../theme"
import { Checkbox } from "react-native-ui-lib"
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data"
import { AccountRole, AccountRoleText } from "../../../../../config/types"
import { Organization } from "../../../../../../core/models/domain/organization"
import { PasswordAction } from "../../passwords/password-action"
import { CardAction } from "../../cards/card-action"
import { NoteAction } from "../../notes/note-action"
import { IdentityAction } from "../../identities/identity-action"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"
import { PendingSharedAction } from "./pending-shared-action"


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
  const { getWebsiteLogo, translate, color } = useMixins()
  const { getCiphers } = useCipherDataMixins()
  const { cipherStore } = useStores()
  const { newCipher } = useCipherHelpersMixins()
  type ListItem = CipherView & {
    isShared?: boolean
    description?: string
    logo?: any
    imgLogo?: any
    svg?: any
    notSync?: boolean
  }

  // ------------------------ PARAMS ----------------------------

  const [ciphers, setCiphers] = useState<ListItem[]>([])
  const [showPasswordAction, setShowPasswordAction] = useState(false)
  const [showNoteAction, setShowNoteAction] = useState(false)
  const [showIdentityAction, setShowIdentityAction] = useState(false)
  const [showCardAction, setShowCardAction] = useState(false)
  const [showPendingAction, setShowPendingAction] = useState(false)

  // ------------------------ COMPUTED ----------------------------
 
  const organizations = cipherStore.organizations
  const pendingCiphers = cipherStore.sharingInvitations.map(i => {
    const cipher: ListItem = newCipher(i.cipher_type)
    cipher.isShared = true
    cipher.id = i.id
    cipher.organizationId = i.team.id
    cipher.name = `(${translate('shares.encrypted_content')})`
    switch (i.cipher_type) {
      case CipherType.Login: {
        cipher.logo = BROWSE_ITEMS.password.icon
        break
      }
      case CipherType.SecureNote: {
        cipher.logo = BROWSE_ITEMS.note.icon
        cipher.svg = BROWSE_ITEMS.note.svgIcon
        break
      }
      case CipherType.Card: {
        cipher.logo = BROWSE_ITEMS.card.icon
        break
      }
      case CipherType.Identity: {
        cipher.logo = BROWSE_ITEMS.identity.icon
        cipher.svg = BROWSE_ITEMS.identity.svgIcon
        break
      }
      default:
        cipher.logo = BROWSE_ITEMS.trash.icon
        cipher.svg = BROWSE_ITEMS.trash.svgIcon
    }
    let shareType = ''
    if (i.role === AccountRoleText.MEMBER) {
      if (i.hide_passwords) {
        shareType = translate('shares.share_type.only_fill')
      } else {
        shareType = translate('shares.share_type.view')
      }
    }
    if (i.role === AccountRoleText.ADMIN) {
      shareType = translate('shares.share_type.edit')
    }
    cipher.description = `${i.team.name} - ${shareType}`
    return cipher
  })

  const allCiphers = !!searchText.trim() || isSelecting ? ciphers : [...pendingCiphers, ...ciphers]

  // ------------------------ EFFECTS ----------------------------

  useEffect(() => {
    loadData()
  }, [searchText, cipherStore.lastSync, cipherStore.lastCacheUpdate, sortList])

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
    const searchRes = await getCiphers({
      filters,
      searchText,
      deleted: false
    })

    // Add image + org info
    let res = searchRes.map((c: CipherView) => {
      const data = {
        ...c,
        logo: null,
        imgLogo: null,
        svg: null,
        notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(c.id)
      }
      switch (c.type) {
        case CipherType.Login: {
          if (c.login.uri) {
            data.imgLogo = getWebsiteLogo(c.login.uri)
          }
          data.logo = BROWSE_ITEMS.password.icon
          break
        }

        case CipherType.SecureNote: {
          data.logo = BROWSE_ITEMS.note.icon
          data.svg = BROWSE_ITEMS.note.svgIcon
          break
        }

        case CipherType.Card: {
          data.logo = BROWSE_ITEMS.card.icon
          break
        }

        case CipherType.Identity: {
          data.logo = BROWSE_ITEMS.identity.icon
          data.svg = BROWSE_ITEMS.identity.svgIcon
          break
        }

        default:
          data.logo = BROWSE_ITEMS.trash.icon
          data.svg = BROWSE_ITEMS.trash.svgIcon
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
  const openActionMenu = (item: ListItem) => {
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
      default:
        return
    }
  }

  // Go to detail
  const goToDetail = (item: ListItem) => {
    cipherStore.setSelectedCipher(item)
    if (item.isShared) {
      setShowPendingAction(true)
      return
    }
    switch (item.type) {
      case CipherType.Login:
        navigation.navigate('passwords__info')
        break
      case CipherType.Card:
        navigation.navigate('cards__info')
        break
      case CipherType.Identity:
        navigation.navigate('identities__info')
        break
      case CipherType.SecureNote:
        navigation.navigate('notes__info')
        break
    }
  }

  // Get cipher description
  const getDescription = (item: ListItem) => {
    if (item.isShared) {
      return item.description
    }

    const org = _getOrg(item.organizationId)
    let shareType = ''
    if (org) {
      switch (org.type) {
        case AccountRole.MEMBER:
          shareType = item.viewPassword ? translate('shares.share_type.view') : translate('shares.share_type.only_fill')
          break
        case AccountRole.ADMIN:
          shareType = translate('shares.share_type.edit')
          break
      }
    }
    return org ? `${org.name} - ${shareType}` : ''
  }

  // Toggle item selection
  const toggleItemSelection = (item: ListItem) => {
    if (!isSelecting) {
      setIsSelecting(true)
    }
    let selected = [...selectedItems]
    if (!selected.includes(item.id)) {
      selected.push(item.id)
    } else {
      selected = selected.filter(id => id !== item.id)
    }
    setSelectedItems(selected)
  }

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

      <PendingSharedAction
        isOpen={showPendingAction}
        onClose={() => setShowPendingAction(false)}
        onLoadingChange={onLoadingChange}
      />

      {/* Action menus end */}

      {/* Cipher list */}
      <FlatList
        style={{ 
          paddingHorizontal: 20, 
        }}
        data={allCiphers}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <Button
            preset="link"
            onPress={() => {
              if (isSelecting) {
                toggleItemSelection(item)
              } else {
                goToDetail(item)
              }
            }}
            onLongPress={() => !item.isShared && toggleItemSelection(item)}
            style={{
              borderBottomColor: color.line,
              borderBottomWidth: 0.5,
              paddingVertical: 15
            }}
          >
            <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
              {/* Cipher avatar */}
              {
                item.svg ? (
                  <item.svg height={40} width={40} />
                ) : (
                  <Image
                    source={item.imgLogo || item.logo}
                    backupSource={item.logo}
                    style={{
                      height: 40,
                      width: 40,
                      borderRadius: 8
                    }}
                  />
                )
              }
              {/* Cipher avatar end */}

              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, { flexWrap: 'wrap' }]}>
                  <Text
                    preset="semibold"
                    text={item.name}
                    numberOfLines={2}
                  />

                  {/* Pending status */}
                  {
                    item.isShared && (
                      <View style={{
                        paddingHorizontal: 10,
                        paddingVertical: 2,
                        backgroundColor: color.warning,
                        borderRadius: 3,
                        marginLeft: 10
                      }}>
                        <Text
                          text="PENDING"
                          style={{
                            fontWeight: 'bold',
                            color: color.background,
                            fontSize: fontSize.mini
                          }}
                        />
                      </View>
                    )
                  }
                  {/* Pending status */}

                  {/* Not sync icon */}
                  {
                    item.notSync && (
                      <View style={{ marginLeft: 10 }}>
                        <MaterialCommunityIconsIcon
                          name="cloud-off-outline"
                          size={22}
                          color={color.textBlack}
                        />
                      </View>
                    )
                  }
                  {/* Not sync icon end */}
                </View>

                {/* Description */}
                {
                  !!getDescription(item) && (
                    <Text
                      text={getDescription(item)}
                      style={{ fontSize: fontSize.small }}
                    />
                  )
                }
                {/* Description end */}
              </View>

              {
                isSelecting ? (
                  <Checkbox
                    value={selectedItems.includes(item.id)}
                    color={color.primary}
                    onValueChange={() => {
                      toggleItemSelection(item)
                    }}
                  />
                ) : (
                  <Button
                    preset="link"
                    onPress={() => openActionMenu(item)}
                    style={{ 
                      height: 40,
                      width: 40,
                      justifyContent: 'flex-end',
                      alignItems: 'center'
                    }}
                  >
                    <IoniconsIcon
                      name="ellipsis-horizontal"
                      size={18}
                      color={color.textBlack}
                    />
                  </Button>
                )
              }
            </View>
          </Button>
        )}
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
