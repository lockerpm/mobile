import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { View, ScrollView, ViewStyle, TextStyle, Share, Dimensions } from 'react-native'
import { Layout, Text, AutoImage as Image, Button } from '../../../../components'
import { useNavigation } from '@react-navigation/native'
import { useStores } from '../../../../models'
import { useCipherAuthenticationMixins } from '../../../../services/mixins/cipher/authentication'
import { PlanType } from '../../../../config/types'
import { fontSize, commonStyles } from '../../../../theme'
import { useMixins } from '../../../../services/mixins'
import { MenuItem, MenuItemProps } from './menu-item'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Invitation, InvitationData } from './invitation'
import { getVersion } from 'react-native-device-info'
import { ReferFriendMenuItem } from './refer-friend-menu-item'
import { useAdaptiveLayoutMixins } from '../../../../services/mixins/adaptive-layout'
import Intercom, { IntercomEvents } from '@intercom/intercom-react-native'
import PlanIcon from './star.svg'
import InviteIcon from './invite.svg'
import SettingsIcon from './gear.svg'
import HelpIcon from './question.svg'
import LockIcon from './lock.svg'
import PlanIconLight from './star-light.svg'
import InviteIconLight from './invite-light.svg'
import SettingsIconLight from './gear-light.svg'
import HelpIconLight from './question-light.svg'
import LockIconLight from './lock-light.svg'
import moment from 'moment'

export const MenuScreen = observer(() => {
  const navigation = useNavigation()
  const { user } = useStores()
  const { translate, color, isDark, notifyApiError } = useMixins()
  const { lock, logout } = useCipherAuthenticationMixins()
  const { isTablet } = useAdaptiveLayoutMixins()
  const appVersion = `${getVersion()}`
  const isFreeAccount = user.isFreePlan
  const isPremiumAccount = user.isShowPremiumFeature
  const [isLoading, setIsLoading] = useState(false)
  const [showFingerprint, setShowFingerprint] = useState(false)
  const [referLink, setReferLink] = useState<string>(null)

  // Intercom service
  const [unreadConversationCount, setUnreadConversationCount] = useState<number>(0)

  const PLAN_NAME: TextStyle = {
    fontSize: fontSize.small,
    marginTop: 5,
  }
  const ITEM_CONTAINER: ViewStyle = {
    backgroundColor: isDark ? color.block : color.background,
    borderRadius: 10,
    paddingHorizontal: 14,
  }

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

  const items: MenuItemProps[] = [
    {
      family: user.plan?.alias !== PlanType.FAMILY,
      icon: isDark ? <InviteIconLight height={22} /> : <InviteIcon height={22} />,
      name: translate('menu.invite'),
      action: () => {
        if (isFreeAccount || (isPremiumAccount && !user.plan?.is_family)) {
          navigation.navigate('payment', { family: true, benefitTab: 3 })
        } else {
          navigation.navigate('invite_member')
        }
      },
      hide: user.pwd_user_type === 'enterprise' || user.isLifeTimePremiumPlan,
    },
    {
      icon: isDark ? <PlanIconLight height={22} /> : <PlanIcon height={22} />,
      name: translate('menu.plan'),
      action: () => navigation.navigate('payment'),
      hide:
        user.pwd_user_type === 'enterprise' ||
        user.isLifeTimePremiumPlan ||
        user.isLifeTimeFamilyPlan,
    },
    {
      icon: isDark ? <SettingsIconLight height={22} /> : <SettingsIcon height={22} />,
      name: translate('common.settings'),
      action: () => navigation.navigate('settings'),
    },
    {
      icon: isDark ? <HelpIconLight height={22} /> : <HelpIcon height={22} />,
      name: translate('common.help'),
      action: () => navigation.navigate('help'),
      noBorder: true,
    },
  ]

  const items2: MenuItemProps[] = [
    {
      icon: isDark ? <LockIconLight height={22} /> : <LockIcon height={22} />,
      name: translate('common.lock'),
      action: async () => {
        setIsLoading(true)
        await lock()
        setIsLoading(false)
        navigation.navigate('lock')
      },
    },
    {
      icon: <Ionicons name={'log-out-outline'} color={color.textBlack} size={22} />,
      name: translate('common.logout'),
      action: async () => {
        setIsLoading(true)
        await logout()
        setIsLoading(false)
        navigation.navigate('login')
      },
      noBorder: true,
    },
  ]
  const isSmallWidth = Dimensions.get('screen').width < 390
  const item3 = {
    pm_lifetime_family: {
      node: <Text text="LIFETIME FAMILY" style={[PLAN_NAME, { color: color.primary }]}></Text>,
    },
    pm_lifetime_premium: {
      node: <Text text="LIFETIME PREMIUM" style={[PLAN_NAME, { color: color.primary }]}></Text>,
    },
    pm_free: {
      node: <Text text="FREE" style={[PLAN_NAME, { color: color.textBlack }]}></Text>,
    },
    pm_premium: {
      node: (
        <View style={{ flexDirection: isSmallWidth ? 'column' : 'row' }}>
          <Text text="PREMIUM" style={[PLAN_NAME, { color: color.primary }]}></Text>
          <Text
            text={
              translate('menu.expired_time') +
              ': ' +
              moment(user.plan?.next_billing_time * 1000).format('DD MMMM YYYY')
            }
            style={[PLAN_NAME, { marginLeft: isSmallWidth ? 0 : 8 }]}
          ></Text>
        </View>
      ),
    },
    pm_family: {
      node: (
        <View style={{ flexDirection: isSmallWidth ? 'column' : 'row' }}>
          <Text text="FAMILY" style={[PLAN_NAME, { color: color.primary }]}></Text>
          <Text
            text={
              translate('menu.expired_time') +
              ': ' +
              moment(user.plan?.next_billing_time * 1000).format('DD MMMM YYYY')
            }
            style={[PLAN_NAME, { marginLeft: isSmallWidth ? 0 : 8 }]}
          ></Text>
        </View>
      ),
    },
  }

  const onShare = async () => {
    try {
      await Share.share({
        message: translate('refer_friend.refer_header') + referLink,
      })
    } catch (error) {
      alert(error.message)
    }
  }

  // -------------- RENDER --------------------

  return (
    <Layout
      borderBottom
      hasBottomNav
      isContentOverlayLoading={isLoading}
      containerStyle={{ backgroundColor: isDark ? color.background : color.block }}
      header={<Text preset="largeHeader" text={translate('common.menu')} />}
    >
      <ScrollView>
        {/* User info */}
        <Button
          onPress={() => {
            navigation.navigate('manage_plan')
          }}
          style={[
            ITEM_CONTAINER,
            { marginBottom: 15, paddingVertical: 14, justifyContent: 'flex-start' },
          ]}
        >
          {!!user.avatar && (
            <Image
              source={{ uri: user.avatar }}
              style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
            />
          )}
          <View style={{ flex: 1 }}>
            <Text preset="black" text={user.email} />
            {user.pwd_user_type !== 'enterprise' && user.plan && item3[user.plan.alias]?.node}
            {user.pwd_user_type === 'enterprise' && user.enterprise && (
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 5,
                  alignItems: 'center',
                }}
              >
                <Text
                  preset="black"
                  text={translate('common.enterprise') + ':'}
                  style={{ marginRight: 8 }}
                />
                <Text text={user.enterprise.name} style={{ color: color.primary }} />
              </View>
            )}
          </View>
          <FontAwesome name="angle-right" size={18} color={color.textBlack} />
        </Button>
        {/* User info end */}

        {/* Fingerprint */}
        <Button
          preset="link"
          onPress={() => setShowFingerprint(!showFingerprint)}
          style={[
            ITEM_CONTAINER,
            {
              marginBottom: 15,
              paddingVertical: 14,
              justifyContent: 'space-between',
              alignItems: 'center',
            },
          ]}
        >
          <View style={{ flex: 1, paddingRight: 5 }}>
            <Text preset="black" text={translate('menu.fingerprint')} />
            {showFingerprint && (
              <Text
                style={{
                  color: color.error,
                  marginTop: 5,
                }}
                text={user.fingerprint}
              />
            )}
          </View>

          <FontAwesome name={showFingerprint ? 'eye-slash' : 'eye'} size={18} color={color.text} />
        </Button>
        {/* Fingerprint end */}

        {/* Invitations */}
        {user.invitations.map((item: InvitationData) => (
          <Invitation key={item.id} {...item} />
        ))}
        {/* Invitations end */}

        <View style={ITEM_CONTAINER}>
          {items.map((item, index) => (
            <MenuItem key={index} {...item} />
          ))}
        </View>

        {user.pwd_user_type !== 'enterprise' && !user.isLifeTimeFamilyPlan && (
          <ReferFriendMenuItem
            onPress={
              isTablet
                ? () => onShare()
                : () =>
                    navigation.navigate('refer_friend', {
                      referLink: referLink,
                    })
            }
          />
        )}

        <View style={[ITEM_CONTAINER, { marginTop: 24 }]}>
          <Button
            preset="link"
            onPress={() => Intercom.displayMessenger()}
            style={[
              commonStyles.CENTER_HORIZONTAL_VIEW,
              {
                paddingVertical: 16,
                borderBottomColor: color.line,
              },
            ]}
          >
            <View style={{ width: 25 }}>
              <AntDesign name={'customerservice'} color={color.textBlack} size={22} />
            </View>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <Text
                preset="black"
                text={translate('common.customer_service')}
                style={{ paddingHorizontal: 10 }}
              />
              {unreadConversationCount > 0 && (
                <View
                  style={{
                    backgroundColor: color.error,
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
                      color: color.white,
                      lineHeight: 17,
                    }}
                  />
                </View>
              )}
            </View>
            <FontAwesome name="angle-right" size={18} color={color.textBlack} />
          </Button>
        </View>

        <View style={[ITEM_CONTAINER, { marginTop: 24 }]}>
          {items2.map((item, index) => (
            <MenuItem key={index} {...item} />
          ))}
        </View>

        <View
          style={{
            alignItems: 'center',
          }}
        >
          <View
            style={{
              marginTop: 24,
              flexDirection: 'row',
            }}
          >
            <Text style={{ marginBottom: 2 }}>{translate('menu.product_of')}</Text>
            <Image
              source={require('./cystack.png')}
              style={{
                width: 78,
                height: 24,
              }}
            />
          </View>
          <Text style={{ marginTop: 8 }}>Locker - {appVersion}</Text>
        </View>
      </ScrollView>
    </Layout>
  )
})
