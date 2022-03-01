import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ScrollView, ViewStyle, Linking } from "react-native"
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


// @ts-ignore
import PlanIcon from './star.svg'
// @ts-ignore
import InviteIcon from './invite.svg'
// @ts-ignore
import SettingsIcon from './gear.svg'
// @ts-ignore
import HelpIcon from './question.svg'
// @ts-ignore
import LockIcon from './lock.svg'
// @ts-ignore
import PlanIconLight from './star-light.svg'
// @ts-ignore
import InviteIconLight from './invite-light.svg'
// @ts-ignore
import SettingsIconLight from './gear-light.svg'
// @ts-ignore
import HelpIconLight from './question-light.svg'
// @ts-ignore
import LockIconLight from './lock-light.svg'
import { useCipherAuthenticationMixins } from "../../../../services/mixins/cipher/authentication"


export const MenuScreen = observer(function MenuScreen() {
  const navigation = useNavigation()
  const { user, uiStore } = useStores()
  const { translate, notify, color, isDark } = useMixins()
  const { lock, logout } = useCipherAuthenticationMixins()

  const [isLoading, setIsLoading] = useState(false)
  const [showFingerprint, setShowFingerprint] = useState(false)

  const items: MenuItemProps[] = [
    {
      icon: isDark ? <PlanIconLight height={22} /> : <PlanIcon height={22} />,
      name: translate('menu.plan'),
      action: () => {
        // Linking.openURL(MANAGE_PLAN_URL)
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

  // -------------- RENDER --------------------

  const ITEM_CONTAINER: ViewStyle = {
    backgroundColor: isDark ? color.block : color.background,
    borderRadius: 10,
    paddingHorizontal: 14,
  }

  return (
    <Layout
      borderBottom
      isContentOverlayLoading={isLoading}
      containerStyle={{ backgroundColor: isDark ? color.background : color.block }}
      header={(
        <Text preset="largeHeader" text={translate('common.menu')} />
      )}
    >
      <ScrollView>
        {/* User info */}
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
            <Text style={{ fontSize: fontSize.small, marginTop: 5 }}>
              {user.plan && user.plan.name}
            </Text>
          </View>
        </View>
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
          <View>
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
