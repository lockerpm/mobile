// export * from './NotificationSettingsScreen'
// export * from './notification/PushNotificationSettingsScreen'
// export * from './email/PushEmailSettingsScreen'

import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import {
  NotificationSettingsScreen,
  PushEmailSettingsScreen,
  PushNotificationSettingsScreen,
} from "./screens"
import { NotificationSettingsRoute } from "./route"

const Stack = createStackNavigator<NotificationSettingsRoute>()

export const NotificationSettingsStack = observer(() => {
  // ------------------ RENDER --------------------

  return (
    <Stack.Navigator
      initialRouteName="notiOptions"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="notiOptions" component={NotificationSettingsScreen} />
      <Stack.Screen name="emailNoti" component={PushEmailSettingsScreen} />
      <Stack.Screen name="deviceNoti" component={PushNotificationSettingsScreen} />
    </Stack.Navigator>
  )
})
