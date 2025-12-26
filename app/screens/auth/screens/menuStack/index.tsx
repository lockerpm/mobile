import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"

import { MenuRoute } from "app/navigators"

import {
  HelpScreen,
  InviteToFamilyStack,
  PaymentScreen,
  ReferFriendScreen,
  SettingsStack,
  WelcomePremiumScreen,
} from "./screens"

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
      <Stack.Screen name="inviteToFamilyStack" component={InviteToFamilyStack} />
      <Stack.Screen name="settingsStack" component={SettingsStack} />
      <Stack.Screen name="payment" component={PaymentScreen} />
      <Stack.Screen name="welcomePremium" component={WelcomePremiumScreen} />
      <Stack.Screen name="referFriend" component={ReferFriendScreen} />
    </Stack.Navigator>
  )
})
