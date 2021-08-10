import React, { useState } from "react"
import { View } from "react-native"
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
  const items = [
    {
      logo: BROWSE_ITEMS.password.icon,
      name: 'Facebook',
      owner: 'duchm',
      type: CipherType.Login
    },
    {
      logo: BROWSE_ITEMS.password.icon,
      name: 'Facebook',
      owner: 'duchm',
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
    emptyContent
  ) : (
    <View>
      {/* Action menus */}
      <PasswordAction
        isOpen={showPasswodAction}
        onClose={() => setShowPasswodAction(false)}
        navigation={navigation}
      />
      {/* Action menus end */}

      {/* Cipher list */}
      {
        items.map((item, index) => (
          <Button
            key={index}
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
                <Text
                  text={item.owner}
                  style={{
                    fontSize: 12
                  }}
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
        ))
      }
      {/* Cipher list end */}
    </View>
  )
})
