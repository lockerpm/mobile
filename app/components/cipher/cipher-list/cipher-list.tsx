import React, { useState, useEffect } from "react"
import { View, FlatList } from "react-native"
import { observer } from "mobx-react-lite"
import orderBy from 'lodash/orderBy'
import { Button } from "../../button/button"
import { Text } from "../../text/text"
import { AutoImage as Image } from "../../auto-image/auto-image"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { CipherType } from "../../../../core/enums"
import { useMixins } from "../../../services/mixins"
import { useStores } from "../../../models"
import { CipherView } from "../../../../core/models/view"
import { BROWSE_ITEMS } from "../../../common/mappings"
import { PasswordAction } from "../../../screens/auth/browse/passwords/password-action"
import { CardAction } from "../../../screens/auth/browse/cards/card-action"
import { IdentityAction } from "../../../screens/auth/browse/identities/identity-action"
import { NoteAction } from "../../../screens/auth/browse/notes/note-action"
import { color as colorLight, colorDark, commonStyles, fontSize } from "../../../theme"
import { DeletedAction } from "../cipher-action/deleted-action"


export interface CipherListProps {
  emptyContent?: JSX.Element,
  navigation: any,
  searchText?: string,
  onLoadingChange?: Function,
  cipherType?: CipherType,
  deleted?: boolean,
  sortList?: {
    orderField: string,
    order: string
  },
  folderId?: string,
  collectionId?: string,
  organizationId?: string,
  isPersonalUndefined?: boolean
}

/**
 * Describe your component here
 */
export const CipherList = observer(function CipherList(props: CipherListProps) {
  const {
    emptyContent, navigation, onLoadingChange, searchText, deleted = false, sortList, folderId,
    collectionId, organizationId, isPersonalUndefined
  } = props
  const { getWebsiteLogo, getCiphers, translate } = useMixins()
  const { cipherStore, uiStore } = useStores()
  const color = uiStore.isDark ? colorDark : colorLight

  // ------------------------ PARAMS ----------------------------

  const [showPasswordAction, setShowPasswordAction] = useState(false)
  const [showNoteAction, setShowNoteAction] = useState(false)
  const [showIdentityAction, setShowIdentityAction] = useState(false)
  const [showCardAction, setShowCardAction] = useState(false)
  const [showDeletedAction, setShowDeletedAction] = useState(false)
  const [ciphers, setCiphers] = useState([])

  // ------------------------ WATCHERS ----------------------------

  useEffect(() => {
    loadData()
  }, [searchText, cipherStore.lastSync, cipherStore.lastOfflineSync, sortList])

  // ------------------------ METHODS ----------------------------

  // Get ciphers list
  const loadData = async () => {
    // onLoadingChange && onLoadingChange(true)

    // Filter
    const filters = []
    if (props.cipherType) {
      filters.push((c : CipherView) => c.type === props.cipherType)
    }

    // Search
    const searchRes = await getCiphers({
      filters,
      searchText,
      deleted
    })

    // Add image
    let res = searchRes.map((c: CipherView) => {
      const data = {
        ...c,
        logo: null,
        imgLogo: null,
        svg: null,
        notSync: cipherStore.notSynchedCiphers.includes(c.id)
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

    // Filter
    if (folderId !== undefined) {
      res = res.filter(i => i.folderId === folderId)
    }
    if (collectionId !== undefined) {
      res = res.filter(i => i.collectionIds.includes(collectionId))
    }
    if (isPersonalUndefined) {
      res = res.filter(i => !i.collectionIds.length)
    }
    if (organizationId !== undefined) {
      if (organizationId === null) {
        res = res.filter(i => !!i.organizationId)
      } else {
        res = res.filter(i => i.organizationId === organizationId)
      }
    }

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
    setCiphers(res)
  }

  // Handle action menu open
  const openActionMenu = (item: CipherView) => {
    cipherStore.setSelectedCipher(item)
    if (deleted) {
      setShowDeletedAction(true)
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
  const goToDetail = (item: CipherView) => {
    cipherStore.setSelectedCipher(item)
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
  const getDescription = (item: CipherView) => {
    switch (item.type) {
      case CipherType.Login:
        return item.login.username
      case CipherType.Card:
        return (item.card.brand && item.card.number) 
          ? `${item.card.brand}, *${item.card.number.slice(-4)}`
          : ''
      case CipherType.Identity:
        return item.identity.fullName
    }
    return ''
  }

  // ------------------------ RENDER ----------------------------

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

      <DeletedAction
        isOpen={showDeletedAction}
        onClose={() => setShowDeletedAction(false)}
        navigation={navigation}
        onLoadingChange={onLoadingChange}
      />

      {/* Action menus end */}

      {/* Cipher list */}
      <FlatList
        style={{ paddingHorizontal: 20 }}
        data={ciphers}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <Button
            preset="link"
            onPress={() => goToDetail(item)}
            style={{
              borderBottomColor: color.line,
              borderBottomWidth: 1,
              paddingVertical: 15
            }}
          >
            <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
              {
                item.svg ? (
                  <item.svg height={40} width={40} />
                ) : (
                  <Image
                    source={item.imgLogo || item.logo}
                    backupSource={item.logo}
                    style={{
                      height: 40,
                      width: 40
                    }}
                  />
                )
              }

              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, { flexWrap: 'wrap' }]}>
                  <Text
                    preset="semibold"
                    text={item.name}
                  />

                  {
                    item.organizationId && (
                      <View style={{ marginLeft: 10 }}>
                        <MaterialCommunityIconsIcon
                          name="account-group-outline"
                          size={22}
                          color={color.textBlack}
                        />
                      </View>
                    )
                  }

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
                </View>

                {
                  !!getDescription(item) && (
                    <Text
                      text={getDescription(item)}
                      style={{ fontSize: fontSize.small }}
                    />
                  )
                }
              </View>

              <Button
                preset="link"
                onPress={() => openActionMenu(item)}
                style={{ height: 40, alignItems: 'center' }}
              >
                <IoniconsIcon
                  name="ellipsis-horizontal"
                  size={18}
                  color={color.textBlack}
                />
              </Button>
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
