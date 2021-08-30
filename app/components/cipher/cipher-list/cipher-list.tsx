import React, { useState, useEffect } from "react"
import { View, FlatList } from "react-native"
import { observer } from "mobx-react-lite"
import orderBy from 'lodash/orderBy'
import { Button, AutoImage as Image, Text } from "../../"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { CipherType } from "../../../../core/enums"
import { useMixins } from "../../../services/mixins"
import { useStores } from "../../../models"
import { CipherView } from "../../../../core/models/view"
import { BROWSE_ITEMS } from "../../../common/mappings"
import { PasswordAction } from "../../../screens/auth/browse/passwords/password-action"
import { CardAction } from "../../../screens/auth/browse/cards/card-action"
import { IdentityAction } from "../../../screens/auth/browse/identities/identity-action"
import { NoteAction } from "../../../screens/auth/browse/notes/note-action"
import { color, commonStyles } from "../../../theme"


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
  folderId?: string
}

/**
 * Describe your component here
 */
export const CipherList = observer(function CipherList(props: CipherListProps) {
  const { 
    emptyContent, navigation, onLoadingChange, searchText, deleted = false, sortList, folderId
  } = props
  const { getWebsiteLogo, getCiphers } = useMixins()
  const { cipherStore } = useStores()

  // ------------------------ PARAMS ----------------------------

  const [showPasswordAction, setShowPasswordAction] = useState(false)
  const [showNoteAction, setShowNoteAction] = useState(false)
  const [showIdentityAction, setShowIdentityAction] = useState(false)
  const [showCardAction, setShowCardAction] = useState(false)
  const [ciphers, setCiphers] = useState([])

  // ------------------------ WATCHERS ----------------------------

  useEffect(() => {
    loadData()
  }, [searchText, cipherStore.lastSync, sortList])

  // ------------------------ METHODS ----------------------------

  // Get ciphers list
  const loadData = async () => {
    onLoadingChange(true)

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
        imgLogo: null
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
          break
        }
          
        case CipherType.Card: {
          data.logo = BROWSE_ITEMS.card.icon
          break
        }
          
        case CipherType.Identity: {
          data.logo = BROWSE_ITEMS.indentity.icon
          break
        }
          
        default:
          data.logo = BROWSE_ITEMS.trash.icon
      }
      return data
    })

    // Filter
    if (folderId !== undefined) {
      res = res.filter(i => i.folderId === folderId)
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
      onLoadingChange(false)
    }, 500)
    
    // Done
    setCiphers(res)
    console.log(`Get ${res.length} items`)
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
      default:
        return
    }
  }

  // ------------------------ RENDER ----------------------------

  return !ciphers.length && emptyContent ? (
    <View style={{ paddingHorizontal: 20 }}>
      {emptyContent}
    </View>
  ) : (
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
      />
      <IdentityAction
        isOpen={showIdentityAction}
        onClose={() => setShowIdentityAction(false)}
        navigation={navigation}
      />
      <NoteAction
        isOpen={showNoteAction}
        onClose={() => setShowNoteAction(false)}
        navigation={navigation}
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
            <View style={[commonStyles.CENTER_HORIZONTAL_VIEW]}>
              <Image
                source={item.imgLogo || item.logo}
                backupSource={item.logo}
                style={{
                  height: 40,
                  marginRight: 12
                }}
              />

              <View style={{ flex: 1 }}>
                <Text
                  preset="semibold"
                  text={item.name}
                />
              </View>

              <Button
                preset="link"
                onPress={() => openActionMenu(item)}
              >
                <IoniconsIcon
                  name="ellipsis-horizontal"
                  size={16}
                  color={color.textBlack}
                />
              </Button>
            </View>
          </Button>
        )}
      />
      {/* Cipher list end */}
    </View>
  )
})
