import React, { useState, useEffect } from "react"
import { View, FlatList } from "react-native"
import { observer } from "mobx-react-lite"
import { color, commonStyles } from "../../theme"
import { Button, AutoImage as Image, Text } from "../"
import { BROWSE_ITEMS } from "../../common/mappings"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { CipherType } from "../../../core/enums"
import { PasswordAction } from "../../screens/auth/browse/passwords/password-action"
import { CardAction } from "../../screens/auth/browse/cards/card-action"
import { IdentityAction } from "../../screens/auth/browse/identities/identity-action"
import { NoteAction } from "../../screens/auth/browse/notes/note-action"
import { CipherView } from "../../../core/models/view"
import { useMixins } from "../../services/mixins"
import { useStores } from "../../models"


export interface CipherListProps {
  emptyContent?: JSX.Element,
  navigation: any,
  searchText?: string,
  onLoadingChange?: Function,
  cipherType?: CipherType,
  deleted?: boolean
}

/**
 * Describe your component here
 */
export const CipherList = observer(function CipherList(props: CipherListProps) {
  const { emptyContent, navigation, onLoadingChange, searchText, deleted = false } = props
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
  }, [searchText, cipherStore.lastSync])

  // ------------------------ METHODS ----------------------------

  // Get ciphers list
  const loadData = async () => {
    onLoadingChange(true)

    // Filter
    const filters = []
    if (props.cipherType) {
      filters.push((c : CipherView) => c.type === props.cipherType)
    }

    // Data is similar to CipherView
    const searchRes = await getCiphers({
      filters,
      searchText,
      deleted
    })
    const res = searchRes.map((c: CipherView) => {
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

    setTimeout(() => {
      onLoadingChange(false)
    }, 500)
    
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
