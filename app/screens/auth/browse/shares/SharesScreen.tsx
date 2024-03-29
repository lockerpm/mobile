import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from 'app/services/context'
import { useStores } from 'app/models'
import { SharingStatus } from 'app/static/types'
import { Header, Icon, Screen, Text } from 'app/components/cores'
import { MenuItemContainer } from 'app/components/utils'
import { useHelper } from 'app/services/hook'

export const SharesScreen = observer(() => {
  const navigation = useNavigation()
  const { cipherStore } = useStores()
  const { translate } = useHelper()
  const { colors } = useTheme()

  const menu = [
    {
      path: 'sharedItems',
      name: translate('shares.shared_items'),
      notiCount: cipherStore.sharingInvitations.length,
    },
    {
      path: 'shareItems',
      name: translate('quick_shares.share_option.normal.tl'),
      notiCount: cipherStore.myShares.reduce((total, s) => {
        return total + s.members.filter((m) => m.status === SharingStatus.ACCEPTED).length
      }, 0),
    },
    {
      path: 'quickShareItems',
      name: translate('quick_shares.share_option.quick.tl'),
      notiCount: cipherStore.myShares.reduce((total, s) => {
        return total + s.members.filter((m) => m.status === SharingStatus.ACCEPTED).length
      }, 0),
    },
  ]

  return (
    <Screen
      padding
      preset="auto"
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
          title={translate('shares.shares')}
        />
      }
      backgroundColor={colors.block}
    >
      <MenuItemContainer>
        <ItemButton item={menu[0]} navigation={navigation} bottomBorder={false} />
      </MenuItemContainer>

      <MenuItemContainer title={translate('quick_shares.shared')}>
        {menu.slice(1).map((item, index) => (
          <ItemButton key={index} item={item} navigation={navigation} bottomBorder={index === 0} />
        ))}
      </MenuItemContainer>
    </Screen>
  )
})

interface Props {
  item: {
    path: string
    name: string
    notiCount: number
  }
  navigation: any
  bottomBorder: boolean
}

const ItemButton = ({ item, navigation, bottomBorder }: Props) => {
  const { colors } = useTheme()
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate(item.path)
      }}
      style={{
        borderBottomColor: colors.border,
        borderBottomWidth: bottomBorder ? 1 : 0,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
      }}
    >
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <Text text={item.name} style={{ color: colors.title, marginRight: 12 }} />
        {item.notiCount > 0 && (
          <View
            style={{
              backgroundColor: colors.error,
              borderRadius: 20,
              minWidth: 17,
              height: 17,
            }}
          >
            <Text
              text={item.notiCount >= 100 ? '99+' : item.notiCount.toString()}
              style={{
                fontSize: 12,
                textAlign: 'center',
                color: colors.white,
                lineHeight: 17,
              }}
            />
          </View>
        )}
      </View>
      <Icon icon="caret-right" size={20} color={colors.title} />
    </TouchableOpacity>
  )
}
