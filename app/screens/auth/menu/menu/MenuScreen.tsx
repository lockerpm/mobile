import moment from 'moment'
import React, { useState } from 'react'
import { View, TextStyle, Dimensions, Image } from 'react-native'
import { useNavigation, CommonActions } from '@react-navigation/native'
import { useStores } from 'app/models'
import { useTheme } from 'app/services/context'
import { useAuthentication, useHelper } from 'app/services/hook'
import { Screen, Text, TabHeader } from 'app/components/cores'
import { MenuItem, MenuItemContainer, MenuItemProps } from 'app/components/utils'
import { getVersion } from 'react-native-device-info'
import { observer } from 'mobx-react-lite'

export const MenuScreen = observer(() => {
  const navigation = useNavigation() as any
  const { user } = useStores()
  const { colors } = useTheme()
  const { translate } = useHelper()
  const { lock, logout } = useAuthentication()

  const appVersion = `${getVersion()}`

  const [showFingerprint, setShowFingerprint] = useState(false)

  // ------------------COMPUTED------------------------

  const items: MenuItemProps[] = [
    {
      icon: 'gear',
      name: translate('common.settings'),
      onPress: () => navigation.navigate('settings'),
    },
    {
      icon: 'question',
      name: translate('common.help'),
      onPress: () => navigation.navigate('help'),
    },
  ]

  const items2: MenuItemProps[] = [
    {
      icon: 'lock-key',
      name: translate('common.lock'),
      onPress: async () => {
        await lock()
        navigation.navigate('lock')
      },
    },
    {
      icon: 'sign-out',
      name: translate('common.logout'),
      onPress: async () => {
        await logout()

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'init' }],
          })
        )
      },
    },
  ]
  const isSmallWidth = Dimensions.get('screen').width < 390

  const item3 = {
    pm_lifetime_family: {
      node: <Text text="LIFETIME FAMILY" style={$planName} color={colors.primary} />,
    },

    pm_lifetime_premium: {
      node: <Text text="LIFETIME PREMIUM" style={$planName} color={colors.primary} />,
    },
    pm_free: {
      node: <Text text="FREE" style={$planName}></Text>,
    },
    pm_premium: {
      node: (
        <View style={{ flexDirection: isSmallWidth ? 'column' : 'row' }}>
          <Text text="PREMIUM" color={colors.primary} style={$planName} />
          <Text
            text={
              translate('menu.expired_time') +
              ': ' +
              moment(user.plan?.next_billing_time * 1000).format('DD MMMM YYYY')
            }
            style={[$planName, { marginLeft: isSmallWidth ? 0 : 8 }]}
          />
        </View>
      ),
    },
    pm_family: {
      node: (
        <View style={{ flexDirection: isSmallWidth ? 'column' : 'row' }}>
          <Text text="FAMILY" color={colors.primary} style={$planName} />
          <Text
            text={
              translate('menu.expired_time') +
              ': ' +
              moment(user.plan?.next_billing_time * 1000).format('DD MMMM YYYY')
            }
            style={[$planName, { marginLeft: isSmallWidth ? 0 : 8 }]}
          />
        </View>
      ),
    },
  }
  // -------------- RENDER --------------------

  return (
    <Screen
      preset="auto"
      padding
      backgroundColor={colors.block}
      header={<TabHeader title={translate('common.menu')} />}
    >
      <MenuItemContainer>
        <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{ uri: user.avatar }}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <Text text={user.email} />
            {user.pwd_user_type !== 'enterprise' && user.plan && item3[user.plan.alias]?.node}
            {user.pwd_user_type === 'enterprise' && user.enterprise && (
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 5,
                  alignItems: 'center',
                }}
              >
                <Text text={translate('common.enterprise') + ':'} style={{ marginRight: 8 }} />
                <Text preset="bold" text={user.enterprise.name} color={colors.primary} />
              </View>
            )}
          </View>
        </View>
      </MenuItemContainer>

      <MenuItemContainer>
        <MenuItem
          icon={'fingerprint'}
          name={translate('menu.fingerprint')}
          onPress={() => setShowFingerprint(!showFingerprint)}
          rightIcon={showFingerprint ? 'eye-slash' : 'eye'}
          content={
            <View style={{ flex: 1 }}>
              <Text text={translate('menu.fingerprint')} />
              {showFingerprint && (
                <Text
                  style={{
                    color: colors.error,
                    marginTop: 5,
                  }}
                  text={user.fingerprint}
                />
              )}
            </View>
          }
        />
      </MenuItemContainer>

      <MenuItemContainer>
        {items.map((item, index) => (
          <MenuItem key={index} {...item} />
        ))}
      </MenuItemContainer>

      <MenuItemContainer>
        {items2.map((item, index) => (
          <MenuItem key={index} {...item} />
        ))}
      </MenuItemContainer>

      <View
        style={{
          marginTop: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text preset="label">{translate('menu.product_of')}</Text>
        <Text preset="label" weight="semibold">
          {'CyStack'}
        </Text>
      </View>
      <Text preset="label" style={{ marginVertical: 8, textAlign: 'center' }}>
        Locker - {appVersion}
      </Text>
    </Screen>
  )
})

const $planName: TextStyle = {
  fontSize: 14,
  marginTop: 5,
}
