import React from "react"
import { observer } from "mobx-react-lite"
import {
  NotificationSettingsScreen,
  PushEmailSettingsScreen,
  PushNotificationSettingsScreen,
} from "./screens"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { NotificationSettingsRoute } from "app/navigators"

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
