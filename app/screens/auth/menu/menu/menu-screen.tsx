import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ScrollView, ViewStyle, Linking, TextStyle } from "react-native"
import { Layout, Text, AutoImage as Image, Button } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../../models"
import { commonStyles, fontSize } from "../../../../theme"
import { useMixins } from "../../../../services/mixins"
import { MenuItem, MenuItemProps } from "./menu-item"
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { MANAGE_PLAN_URL } from "../../../../config/constants"
import { Invitation, InvitationData } from "./invitation"


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
import { useCipherAuthenticationMixins } from "../../../../services/mixins/cipher/authentication"


export const MenuScreen = observer(function MenuScreen() {
  const navigation = useNavigation()
  const { user, uiStore } = useStores()
  const { translate, notify, color, isDark } = useMixins()
  const { lock, logout } = useCipherAuthenticationMixins()

  const [isLoading, setIsLoading] = useState(false)
  const [showFingerprint, setShowFingerprint] = useState(false)

  const PLAN_NAME: TextStyle = {
    fontSize: fontSize.small, 
    marginTop: 5
  }
  const ITEM_CONTAINER: ViewStyle = {
    backgroundColor: isDark ? color.block : color.background,
    borderRadius: 10,
    paddingHorizontal: 14,
  }

  const items: MenuItemProps[] = [
    {
      icon: isDark ? <PlanIconLight height={22} /> : <PlanIcon height={22} />,
      name: translate('menu.plan'),
      action: () => {
        navigation.navigate('payment')
      }
    },
    // {
    //   icon: isDark ? <InviteIconLight height={22} /> : <InviteIcon height={22} />,
    //   name: translate('menu.invite'),
    //   disabled: true
    // },
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
        notify('error', 'test')
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
        navigation.navigate('onBoarding')
      },
      noBorder: true
    }
  ]

  const item3 = {
    "pm_free": {
      node: <Text text="FREE PLAN" style={[PLAN_NAME, { color: color.textBlack }]}></Text>,
    },
    "pm_premium": {
      node: <Text text="PREMIUM PERSONAL" style={[PLAN_NAME, { color: color.primary }]}></Text>,
    },
    "pm_family": {
      node: <Text text="PREMIUM FAMILY" style={[PLAN_NAME, { color: color.primary }]}></Text>,
    }
  }

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
          onPress={() => {navigation.navigate('manage_plan')}}
          style={[
            ITEM_CONTAINER,
            { marginBottom: 15, paddingVertical: 14 , justifyContent: "flex-start"}
          ]}>
          {
            !!user.avatar && (
              <Image
                source={{ uri: user.avatar }}
                style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
              />
            )
          }
          <View style = {{ flex: 1}}>
            <Text
              preset="black"
              text={user.email}
            />
            {
              user.plan && item3[user.plan.alias].node
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
