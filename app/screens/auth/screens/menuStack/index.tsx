import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import {
  HelpScreen,
  InviteToFamilyStack,
  PaymentScreen,
  ReferFriendScreen,
  SettingsStack,
  WelcomePremiumScreen,
} from "./screens"
import { withIAPContext } from "react-native-iap"
import { MenuRoute } from "app/navigators"

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
      <Stack.Screen name="payment" component={withIAPContext(PaymentScreen)} />
      <Stack.Screen name="welcomePremium" component={WelcomePremiumScreen} />
      <Stack.Screen name="referFriend" component={ReferFriendScreen} />
    </Stack.Navigator>
  )
})
