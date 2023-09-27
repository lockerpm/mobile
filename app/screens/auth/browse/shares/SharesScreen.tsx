import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from 'app/services/context'
import { useStores } from 'app/models'
import { translate } from 'app/i18n'
import { SharingStatus } from 'app/static/types'
import { Header, Icon, Screen, Text } from 'app/components/cores'

export const SharesScreen = observer(() => {
  const navigation = useNavigation()
  const { cipherStore } = useStores()

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
      preset="auto"
      safeAreaEdges={['bottom']}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
          title={translate('shares.shares')}
        />
      }
    >
      <View
        style={{
          borderRadius: 10,
          paddingHorizontal: 14,
          marginTop: 20,
        }}
      >
        <ItemButton item={menu[0]} navigation={navigation} bottomBorder={false} />
      </View>
      <View
        style={{
          borderRadius: 10,
          paddingHorizontal: 16,
          marginTop: 20,
        }}
      >
        <Text
          text={translate('quick_shares.shared')}
          style={{
            marginTop: 12,
            fontSize: 14,
          }}
        />

        {menu.slice(1).map((item, index) => (
          <ItemButton key={index} item={item} navigation={navigation} bottomBorder={index === 0} />
        ))}
      </View>
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
        paddingVertical: 18,
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
