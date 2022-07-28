import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { View, ScrollView, ViewStyle, TextStyle, Share } from "react-native"
import { Layout, Text, AutoImage as Image, Button } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../../models"
import { useCipherAuthenticationMixins } from "../../../../services/mixins/cipher/authentication"
import { commonStyles } from "../../../../theme"
import { PlanType } from "../../../../config/types"
import { fontSize } from "../../../../theme"
import { useMixins } from "../../../../services/mixins"
import { MenuItem, MenuItemProps } from "./menu-item"
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Invitation, InvitationData } from "./invitation"
import { getVersion } from "react-native-device-info"
import { ReferFriendMenuItem } from "./refer-friend-menu-item"
import { useAdaptiveLayoutMixins } from "../../../../services/mixins/adaptive-layout"
import Intercom, { Visibility, IntercomEvents } from "@intercom/intercom-react-native"
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
import { PushNotifier } from "../../../../utils/push-notification"
import { useTestMixins } from "../../../../services/mixins/test"
import moment from "moment"
import { Logger } from "../../../../utils/logger"


export const MenuScreen = observer(() => {
  const navigation = useNavigation()
  const { user, uiStore, cipherStore } = useStores()
  const { translate, notify, color, isDark, notifyApiError } = useMixins()
  const { lock, logout } = useCipherAuthenticationMixins()
  const { createRandomPasswords } = useTestMixins()
  const { isTablet } = useAdaptiveLayoutMixins()
  const appVersion = `${getVersion()}`
  const isFreeAccount = user.plan?.alias === PlanType.FREE
  const isPremiumAccount = user.plan?.alias === PlanType.PREMIUM
  const [isLoading, setIsLoading] = useState(false)
  const [showFingerprint, setShowFingerprint] = useState(false)
  const [referLink, setReferLink] = useState<string>(null)

  // Intercom service 
  const [unreadConversationCount, setUnreadConversationCount] = useState<number>(1)

  const PLAN_NAME: TextStyle = {
    fontSize: fontSize.small,
    marginTop: 5
  }
  const ITEM_CONTAINER: ViewStyle = {
    backgroundColor: isDark ? color.block : color.background,
    borderRadius: 10,
    paddingHorizontal: 14,
  }

  useEffect(() => {
    const getLink = async () => {
      const res = await user.getReferLink()
      if (res.kind === "ok") {
        setReferLink(res.data.referral_link)
      } else {
        notifyApiError(res)
      }
    }
    getLink()
  }, [])


  useEffect(() => {
    const setUpCustomerService = async () => {
      await Intercom.hideIntercom()
      try {
        if (uiStore.isShowIntercomMsgBox) {
          await Intercom.setBottomPadding(100)
          await Intercom.setLauncherVisibility(Visibility.VISIBLE)
        } else {
          await Intercom.setLauncherVisibility(Visibility.GONE)
          const res = await Intercom.getUnreadConversationCount()
          setUnreadConversationCount(res)
        }
      } catch (e) {
        Logger.error(e)
      }
    }
    user.isLoggedInPw && setUpCustomerService()
    return () => {

    }
  }, [uiStore.isShowIntercomMsgBox])

  useEffect(() => {
    const countListener = Intercom.addEventListener(
      IntercomEvents.IntercomUnreadCountDidChange,
      (response) => {
        setUnreadConversationCount(response.count as number);
      }
    );
    return () => {
      countListener.remove();
    };
  }, []);


  const items: MenuItemProps[] = [
    {
      family: user.plan?.alias !== PlanType.FAMILY,
      icon: isDark ? <InviteIconLight height={22} /> : <InviteIcon height={22} />,
      name: translate('menu.invite'),
      action: () => {
        if (isFreeAccount || (isPremiumAccount && !user.plan?.is_family)) {
          navigation.navigate("payment", { family: true, benefitTab: 3 })
        } else {
          navigation.navigate("invite_member")
        }
      },
    },
    {
      icon: isDark ? <PlanIconLight height={22} /> : <PlanIcon height={22} />,
      name: translate('menu.plan'),
      action: () => navigation.navigate('payment'),
    },
    {
      icon: isDark ? <SettingsIconLight height={22} /> : <SettingsIcon height={22} />,
      name: translate('common.settings'),
      action: () => navigation.navigate('settings')
    },
    {
      icon: isDark ? <HelpIconLight height={22} /> : <HelpIcon height={22} />,
      name: translate('common.help'),
      action: () => navigation.navigate('help'),
      noBorder: true
    }
  ]

  const items2: MenuItemProps[] = [
    {
      debug: true,
      icon: isDark ? <InviteIconLight height={22} /> : <InviteIcon height={22} />,
      name: "(DEBUG) Go Free Plan",
      action: () => user.setUserFreePlan(),
      noBorder: true
    },
    {
      debug: true,
      icon: isDark ? <InviteIconLight height={22} /> : <InviteIcon height={22} />,
      name: "(DEBUG) Refer friend",
      action: () => navigation.navigate('refer_friend'),
      noBorder: true
    },
    {
      debug: true,
      icon: isDark ? <LockIconLight height={22} /> : <LockIcon height={22} />,
      name: '(DEBUG) ' + (uiStore.isOffline ? 'Go online' : 'Go offline'),
      action: () => {
        uiStore.setIsOffline(!uiStore.isOffline)
      }
    },
    {
      debug: true,
      icon: isDark ? <LockIconLight height={22} /> : <LockIcon height={22} />,
      name: '(DEBUG) Show toast',
      action: () => {
        notify('error', 'Email xác nhận đã được gửi đến địa chỉ mail của bạn (hãy kiểm tra cả trong hòm thư rác)')
      }
    },
    {
      debug: true,
      icon: isDark ? <LockIconLight height={22} /> : <LockIcon height={22} />,
      name: '(DEBUG) Show push notification',
      action: () => {
        PushNotifier._notify({
          id: `share_new`,
          title: 'Locker',
          body: `You have a new shared test`,
          data: {
            type: 'new_share_item'
          }
        })
      }
    },
    {
      debug: true,
      icon: isDark ? <LockIconLight height={22} /> : <LockIcon height={22} />,
      name: '(DEBUG) Generate 50 random passwords',
      action: () => {
        createRandomPasswords({
          count: 50,
          length: 24
        })
      }
    },
    {
      debug: true,
      icon: isDark ? <LockIconLight height={22} /> : <LockIcon height={22} />,
      name: '(DEBUG) Open welcome premium screen',
      action: () => {
        navigation.navigate("welcome_premium")
      }
    },
    {
      debug: true,
      icon: isDark ? <LockIconLight height={22} /> : <LockIcon height={22} />,
      name: '(DEBUG) Invalidate api token',
      action: () => {
        user.setApiToken('abc')
        cipherStore.setApiToken('abc')
      }
    },
    {
      icon: isDark ? <LockIconLight height={22} /> : <LockIcon height={22} />,
      name: translate('common.lock'),
      action: async () => {
        setIsLoading(true)
        await lock()
        setIsLoading(false)
        navigation.navigate('lock')
      }
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
      noBorder: true
    }
  ]

  const item3 = {
    "pm_free": {
      node: <Text text="FREE" style={[PLAN_NAME, { color: color.textBlack }]}></Text>,
    },
    "pm_premium": {
      node: <View style={{ flexDirection: "row" }}>
        <Text text="PREMIUM" style={[PLAN_NAME, { color: color.primary }]}></Text>
        <Text text={translate("menu.expired_time") + ": " + moment(user.plan?.next_billing_time * 1000).format("DD MMMM YYYY")} style={[PLAN_NAME, { marginLeft: 10 }]}></Text>
      </View>
    },
    "pm_family": {
      node: <View style={{ flexDirection: "row" }}>
        <Text text="FAMILY" style={[PLAN_NAME, { color: color.primary }]}></Text>
        <Text text={translate("menu.expired_time") + ": " + moment(user.plan?.next_billing_time * 1000).format("DD MMMM YYYY")} style={[PLAN_NAME, { marginLeft: 10 }]}></Text>
      </View>,
    }
  }

  const onShare = async () => {
    try {
      await Share.share({
        message: translate("refer_friend.refer_header") + referLink,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  // -------------- RENDER --------------------


  return (
    <Layout
      borderBottom
      hasBottomNav
      isContentOverlayLoading={isLoading}
      containerStyle={{ backgroundColor: isDark ? color.background : color.block }}
      header={(
        <Text preset="largeHeader" text={translate('common.menu')} />
      )}
    >
      <ScrollView>
        {/* User info */}
        <Button
          onPress={() => { navigation.navigate('manage_plan') }}
          style={[
            ITEM_CONTAINER,
            { marginBottom: 15, paddingVertical: 14, justifyContent: "flex-start" }
          ]}>
          {
            !!user.avatar && (
              <Image
                source={{ uri: user.avatar }}
                style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
              />
            )
          }
          <View style={{ flex: 1 }}>
            <Text
              preset="black"
              text={user.email}
            />
            {
              user.plan && item3[user.plan.alias]?.node
            }
          </View>
          <FontAwesome
            name="angle-right"
            size={18}
            color={color.textBlack}
          />
        </Button>
        {/* User info end */}

        {/* Fingerprint */}
        <Button
          preset="link"
          onPress={() => setShowFingerprint(!showFingerprint)}
          style={[ITEM_CONTAINER, {
            marginBottom: 15,
            paddingVertical: 14,
            justifyContent: 'space-between',
            alignItems: 'center'
          }]}
        >
          <View style={{ flex: 1, paddingRight: 5 }}>
            <Text
              preset="black"
              text={translate('menu.fingerprint')}
            />
            {
              showFingerprint && (
                <Text
                  style={{
                    color: color.error,
                    marginTop: 5
                  }}
                  text={user.fingerprint}
                />
              )
            }
          </View>

          <FontAwesome
            name={showFingerprint ? "eye-slash" : "eye"}
            size={18}
            color={color.text}
          />
        </Button>
        {/* Fingerprint end */}

        {/* Invitations */}
        {
          user.invitations.map((item: InvitationData) => (
            <Invitation key={item.id} {...item} />
          ))
        }
        {/* Invitations end */}

        <View style={ITEM_CONTAINER}>
          {
            items.map((item, index) => (
              <MenuItem
                key={index}
                {...item}
              />
            ))
          }
        </View>



        {/*Refer friend */}
        <ReferFriendMenuItem onPress={isTablet ? (() => onShare()) : (() => navigation.navigate('refer_friend', {
          referLink: referLink
        }))} />

        {<View style={ITEM_CONTAINER}>
          <Button
            preset="link"
            onPress={() => Intercom.displayMessenger()}
            style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
              paddingVertical: 16,
              borderBottomColor: color.line,
            }]}
          >
            <View style={{ width: 25 }}>
              <AntDesign name={'customerservice'} color={color.textBlack} size={22} />
            </View>
            <View style={{ flex: 1, flexDirection: "row" }}>
              <Text
                preset="black"
                text={translate("common.customer_service")}
                style={{ paddingHorizontal: 10 }}
              />
              {
                unreadConversationCount > 0 && (
                  <View
                    style={{
                      backgroundColor: color.error,
                      borderRadius: 20,
                      minWidth: 17,
                      height: 17
                    }}
                  >
                    <Text
                      text={unreadConversationCount.toString()}
                      style={{
                        fontSize: 12,
                        textAlign: 'center',
                        color: color.white,
                        lineHeight: 17
                      }}
                    />
                  </View>
                )
              }
            </View>
            <FontAwesome
              name="angle-right"
              size={18}
              color={color.textBlack}
            />
          </Button>
        </View>}


        <View style={[ITEM_CONTAINER, { marginTop: 24 }]}>
          {
            items2.map((item, index) => (
              <MenuItem
                key={index}
                {...item}
              />
            ))
          }
        </View>

        {/*Product of cystack, version */}
        <View style={{
          alignItems: "center"
        }}>
          <View style={{
            marginTop: 24,
            flexDirection: "row"
          }}>
            <Text style={{ marginBottom: 2 }}>{translate('menu.product_of')}</Text>
            <Image source={require('./cystack.png')} style={{
              width: 78, height: 24
            }} />
          </View>
          <Text style={{ marginTop: 8 }}>Locker - {appVersion}</Text>
        </View>

      </ScrollView>
    </Layout>
  )
})
