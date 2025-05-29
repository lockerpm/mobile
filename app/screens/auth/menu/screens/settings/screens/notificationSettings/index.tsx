import React from "react"
import { observer } from "mobx-react-lite"
import {
  NotificationSettingsScreen,
  PushEmailSettingsScreen,
  PushNotificationSettingsScreen,
} from "./screens"
import { NotificationSettingsRoute } from "./route"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

const Stack = createNativeStackNavigator<NotificationSettingsRoute>()

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
