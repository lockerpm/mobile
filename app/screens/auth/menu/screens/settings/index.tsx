import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import {
  ChangeMasterPasswordScreen,
  EmergencyAccessStack,
  ExportScreen,
  ImportScreen,
  NotificationSettingsStack,
  SettingsScreen,
} from "./screens"
// @ts-ignore
import { AutofillServiceScreen } from "./screens/autofillService/AutofillServiceScreen"
import { SettingsRoute } from "app/navigators"

const Stack = createStackNavigator<SettingsRoute>()

export const SettingsStack = observer(() => {
  // ------------------ RENDER --------------------

  return (
    <Stack.Navigator
      initialRouteName="settings"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="settings" component={SettingsScreen} />
      <Stack.Screen name="notiConfigStack" component={NotificationSettingsStack} />
      <Stack.Screen name="changeMasterPassword" component={ChangeMasterPasswordScreen} />
      <Stack.Screen name="import" component={ImportScreen} />
      <Stack.Screen name="autofillService" component={AutofillServiceScreen} />
      <Stack.Screen name="export" component={ExportScreen} />
      <Stack.Screen name="emergencyStack" component={EmergencyAccessStack} />
    </Stack.Navigator>
  )
})
