import moment from 'moment'
import React, { useState, useEffect } from 'react'
import { View, TextStyle, Dimensions } from 'react-native'
import Intercom, { IntercomEvents } from '@intercom/intercom-react-native'
import { useNavigation, CommonActions } from '@react-navigation/native'
import { useStores } from 'app/models'
import { useTheme } from 'app/services/context'
import { useAuthentication, useHelper } from 'app/services/hook'
import { PlanType } from 'app/static/types'
import { Screen, Text, TabHeader } from 'app/components/cores'
import { MenuItem, MenuItemContainer, MenuItemProps } from 'app/components/utils'
import { getVersion } from 'react-native-device-info'
import { ReferFriendMenuItem } from './ReferFriendMenuItem'
import { observer } from 'mobx-react-lite'

export const MenuScreen = observer(() => {
  const navigation = useNavigation() as any
  const { user } = useStores()
  const { colors } = useTheme()
  const { notifyApiError, translate } = useHelper()
  const { lock, logout } = useAuthentication()

  const appVersion = `${getVersion()}`
  const isFreeAccount = user.plan?.alias === PlanType.FREE
  const isPremiumAccount = user.plan?.alias === PlanType.PREMIUM

  const [showFingerprint, setShowFingerprint] = useState(false)
  const [referLink, setReferLink] = useState<string>(null)

  // Intercom service
  const [unreadConversationCount, setUnreadConversationCount] = useState<number>(0)

  // -------------------METHODS-----------------------
  const getUnreadConversationCount = async () => {
    const res = await Intercom.getUnreadConversationCount()
    setUnreadConversationCount(res)
  }

  const getReferralsLink = async () => {
    const res = await user.getReferLink()
    if (res.kind === 'ok') {
      setReferLink(res.data.referral_link)
    } else {
      notifyApiError(res)
    }
  }

  // -------------------EFFECT-----------------------

  useEffect(() => {
    if (!user.onPremiseUser) {
      getReferralsLink()
    } else {
      // user.getEnterprise()
    }
  }, [])

  useEffect(() => {
    getUnreadConversationCount()
    const countListener = Intercom.addEventListener(
      IntercomEvents.IntercomUnreadCountDidChange,
      (response) => {
        setUnreadConversationCount(response.count as number)
      }
    )
    return () => {
      countListener.remove()
    }
  }, [])

  // ------------------COMPUTED------------------------

  const items: MenuItemProps[] = [
    {
      family: user.plan?.alias !== PlanType.FAMILY,
      icon: 'invite',
      name: translate('menu.invite'),
      onPress: () => {
        if (isFreeAccount || (isPremiumAccount && !user.plan?.is_family)) {
          navigation.navigate('payment', { family: true, benefitTab: 3 })
        } else {
          navigation.navigate('invite_member')
        }
      },
      hide: user.pwd_user_type === 'enterprise' || user.isLifeTimePlan,
    },
    {
      icon: 'star',
      name: translate('menu.plan'),
      onPress: () => navigation.navigate('payment'),
      hide: user.pwd_user_type === 'enterprise' || user.isLifeTimePlan,
    },
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
    pm_lifetime_premium: {
      node: <Text text="LIFETIME" style={$planName} color={colors.primary} />,
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
        <MenuItem
          icon={'user'}
          // @ts-ignore
          imageSource={user.avatar}
          name={user.email}
          onPress={() => {
            navigation.navigate('manage_plan')
          }}
          content={
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
          }
        />
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

      {user.pwd_user_type !== 'enterprise' && (
        <ReferFriendMenuItem
          onPress={() =>
            navigation.navigate('refer_friend', {
              referLink,
            })
          }
        />
      )}

      <MenuItemContainer>
        <MenuItem
          icon={'headset'}
          name={translate('menu.fingerprint')}
          onPress={() => Intercom.displayMessenger()}
          content={
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <Text text={translate('common.customer_service')} style={{ paddingHorizontal: 10 }} />
              {unreadConversationCount > 0 && (
                <View
                  style={{
                    backgroundColor: colors.error,
                    borderRadius: 20,
                    minWidth: 17,
                    height: 17,
                  }}
                >
                  <Text
                    text={unreadConversationCount.toString()}
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
          }
        />
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
