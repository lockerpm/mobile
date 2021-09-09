import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ScrollView, ViewStyle } from "react-native"
import { Layout, Text, AutoImage as Image } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../../models"
import { color, commonStyles, fontSize } from "../../../../theme"
import { useMixins } from "../../../../services/mixins"
import { MenuItem, MenuItemProps } from "./menu-item"
import { translate } from "../../../../i18n"


const ITEM_CONTAINER: ViewStyle = {
  backgroundColor: color.palette.white,
  borderRadius: 10,
  paddingHorizontal: 14,
}


export const MenuScreen = observer(function MenuScreen() {
  const navigation = useNavigation()
  const { user } = useStores()
  const { lock, logout } = useMixins()

  const [isLoading, setIsLoading] = useState(false)

  const items: MenuItemProps[] = [
    {
      icon: 'star-o',
      name: translate('menu.plan'),
    },
    {
      icon: 'users',
      name: translate('menu.invite'),
    },
    {
      icon: 'gear',
      name: translate('common.settings'),
      action: () => navigation.navigate('settings')
    },
    {
      icon: 'question-circle-o',
      name: translate('common.help'),
      action: () => navigation.navigate('help'),
      noBorder: true
    }
  ]

  const items2: MenuItemProps[] = [
    {
      icon: 'lock',
      name: translate('common.lock'),
      action: async () => {
        setIsLoading(true)
        await lock()
        setIsLoading(false)
        navigation.navigate('lock')
      }
    },
    {
      icon: 'sign-out',
      name: translate('common.logout'),
      action: async () => {
        setIsLoading(true)
        await logout()
        setIsLoading(false)
        navigation.navigate('onBoarding')
      },
      noBorder: true
    }
  ]



  return (
    <Layout
      borderBottom
      isContentOverlayLoading={isLoading}
      containerStyle={{ backgroundColor: color.block }}
    >
      <Text
        preset="largeHeader"
        text={translate('common.menu')}
        style={{ marginBottom: 16}}
      />
      <ScrollView>
        <View style={[
          ITEM_CONTAINER,
          commonStyles.CENTER_HORIZONTAL_VIEW,
          { marginBottom: 15, paddingVertical: 14 }
        ]}>
          {
            !!user.avatar && (
              <Image
                source={{ uri: user.avatar }}
                style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
              />
            )
          }
          <View>
            <Text
              preset="black"
              text={user.email}
            />
            <Text style={{ fontSize: fontSize.small }}>
              {user.plan.name}
            </Text>
          </View>
        </View>

        <View style={[ITEM_CONTAINER, { marginBottom: 15 }]}>
          {
            items.map((item, index) => (
              <MenuItem
                key={index}
                {...item}
              />
            ))
          }
        </View>

        <View style={ITEM_CONTAINER}>
          {
            items2.map((item, index) => (
              <MenuItem
                key={index}
                {...item}
              />
            ))
          }
        </View>
      </ScrollView>
    </Layout>
  )
})
