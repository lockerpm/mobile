import React, { useState } from "react"
import { View, FlatList } from "react-native"
import { observer } from "mobx-react-lite"
import { color, commonStyles } from "../../theme"
import { Button, AutoImage as Image, Text } from "../"
import { BROWSE_ITEMS } from "../../common/mappings"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { CipherType } from "../../../core/enums"
import { PasswordAction } from "../../screens/auth/browse/passwords/password-info/password-action"


export interface CipherListProps {
  emptyContent?: JSX.Element,
  navigation: any
}

/**
 * Describe your component here
 */
export const CipherList = observer(function CipherList(props: CipherListProps) {
  const { emptyContent, navigation } = props

  // Action menu opener
  const [showPasswodAction, setShowPasswodAction] = useState(false)

  // Data
  // const items = []
  const items = [
    {
      id: 1,
      logo: BROWSE_ITEMS.password.icon,
      name: 'Facebook',
      type: CipherType.Login
    },
    {
      id: 2,
      logo: BROWSE_ITEMS.password.icon,
      name: 'Facebook',
      type: CipherType.Login
    }
  ]

  // Methods
  const openActionMenu = (type: any) => {
    switch (type) {
      case CipherType.Login:
        setShowPasswodAction(true)
        break
      default:
        return
    }
  }

  const goToDetail = (type: any) => {
    switch (type) {
      case CipherType.Login:
        navigation.navigate('passwords__info')
        break
      default:
        return
    }
  }

  return !items.length && emptyContent ? (
    <View style={{ paddingHorizontal: 20 }}>
      {emptyContent}
    </View>
  ) : (
    <View style={{ flex: 1 }}>
      {/* Action menus */}
      <PasswordAction
        isOpen={showPasswodAction}
        onClose={() => setShowPasswodAction(false)}
        navigation={navigation}
      />
      {/* Action menus end */}

      {/* Cipher list */}
      <FlatList
        style={{ paddingHorizontal: 20 }}
        data={items}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <Button
            preset="link"
            onPress={() => goToDetail(item.type)}
            style={{
              borderBottomColor: color.line,
              borderBottomWidth: 1,
              paddingVertical: 15
            }}
          >
            <View style={[commonStyles.CENTER_HORIZONTAL_VIEW]}>
              <Image
                source={item.logo}
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
                onPress={() => openActionMenu(item.type)}
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
