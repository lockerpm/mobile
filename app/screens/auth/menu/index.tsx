import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import { MenuRoute } from "./route"
import {
  HelpScreen,
  InviteMemberScreen,
  ManagePlanScreen,
  PaymentScreen,
  ReferFriendScreen,
  SettingsStack,
  WelcomePremiumScreen,
} from "./screens"
import { withIAPContext } from "react-native-iap"

const Stack = createNativeStackNavigator<MenuRoute>()

export const MenuStack = observer(() => {
  // ------------------ RENDER --------------------

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="help" component={HelpScreen} />
      <Stack.Screen name="inviteMember" component={InviteMemberScreen} />
      <Stack.Screen name="managePlan" component={ManagePlanScreen} />
      <Stack.Screen name="settingsStack" component={SettingsStack} />
      <Stack.Screen name="payment" component={withIAPContext(PaymentScreen)} />
      <Stack.Screen name="welcomePremium" component={WelcomePremiumScreen} />
      <Stack.Screen name="referFriend" component={ReferFriendScreen} />
    </Stack.Navigator>
  )
})
export * from "./menuList"
export * from "./route"
