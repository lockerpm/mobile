import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import { HomeRoute } from "app/navigators"
import {
  BiometricUnlockIntroScreen,
  EnterpriseInvitedScreen,
  InAppListNotificationScreen,
} from "./screens"

const Stack = createStackNavigator<HomeRoute>()

export const HomeStack = observer(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="enterpriseInvited" component={EnterpriseInvitedScreen} />
      <Stack.Screen name="biometricUnlockIntro" component={BiometricUnlockIntroScreen} />
      <Stack.Screen name="appListNoti" component={InAppListNotificationScreen} />
    </Stack.Navigator>
  )
})
