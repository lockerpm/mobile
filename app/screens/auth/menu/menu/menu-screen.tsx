import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ScrollView, ViewStyle, Linking } from "react-native"
import { Layout, Text, AutoImage as Image, Button } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../../models"
import { color as colorLight, colorDark, commonStyles, fontSize } from "../../../../theme"
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


export const MenuScreen = observer(function MenuScreen() {
  const navigation = useNavigation()
  const { user, uiStore } = useStores()
  const { lock, logout, translate } = useMixins()
  const color = uiStore.isDark ? colorDark : colorLight

  const [isLoading, setIsLoading] = useState(false)
  const [showFingerprint, setShowFingerprint] = useState(false)

  const items: MenuItemProps[] = [
    {
      icon: <PlanIcon height={22} />,
      name: translate('menu.plan'),
      action: () => {
        Linking.openURL(MANAGE_PLAN_URL)
      }
    },
    // {
    //   icon: <InviteIcon height={22} />,
    //   name: translate('menu.invite'),
    //   disabled: true
    // },
    {
      icon: <SettingsIcon height={22} />,
      name: translate('common.settings'),
      action: () => navigation.navigate('settings')
    },
    {
      icon: <HelpIcon height={22} />,
      name: translate('common.help'),
      action: () => navigation.navigate('help'),
      noBorder: true
    }
  ]

  const items2: MenuItemProps[] = [
    {
      debug: true,
      icon: <LockIcon height={22} />,
      name: '(DEBUG) ' + (uiStore.isOffline ? 'Go online' : 'Go offline'),
      action: () => {
        uiStore.setIsOffline(!uiStore.isOffline)
      }
    },
    {
      icon: <LockIcon height={22} />,
      name: translate('common.lock'),
      action: async () => {
        setIsLoading(true)
        await lock()
        setIsLoading(false)
        console.log('user lock -> lock')
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
    backgroundColor: color.background,
    borderRadius: 10,
    paddingHorizontal: 14,
  }

  return (
    <Layout
      borderBottom
      style={{ backgroundColor: color.block }}
      isContentOverlayLoading={isLoading}
      containerStyle={{ backgroundColor: color.block }}
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
