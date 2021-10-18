import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ScrollView, ViewStyle, Linking } from "react-native"
import { Layout, Text, AutoImage as Image } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../../models"
import { color, commonStyles, fontSize } from "../../../../theme"
import { useMixins } from "../../../../services/mixins"
import { MenuItem, MenuItemProps } from "./menu-item"
import Ionicons from 'react-native-vector-icons/Ionicons'
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


const ITEM_CONTAINER: ViewStyle = {
  backgroundColor: color.palette.white,
  borderRadius: 10,
  paddingHorizontal: 14,
}


export const MenuScreen = observer(function MenuScreen() {
  const navigation = useNavigation()
  const { user } = useStores()
  const { lock, logout, translate } = useMixins()

  const [isLoading, setIsLoading] = useState(false)

  const items: MenuItemProps[] = [
    {
      icon: <PlanIcon height={22} />,
      name: translate('menu.plan'),
      action: () => {
        Linking.openURL(MANAGE_PLAN_URL)
      }
    },
    {
      icon: <InviteIcon height={22} />,
      name: translate('menu.invite'),
      disabled: true
    },
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
