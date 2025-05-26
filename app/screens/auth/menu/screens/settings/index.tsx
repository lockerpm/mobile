import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import { SettingsRoute } from "./route"
import {
  ChangeMasterPasswordScreen,
  EmergencyAccessStack,
  ExportScreen,
  ImportScreen,
  NotificationSettingsStack,
  SettingsScreen,
} from "./screens"
// // @ts-ignore
// import { AutofillServiceScreen } from "./screens/autofillService/AutofillServiceScreen"

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
      <Stack.Screen name="notificationSettings" component={NotificationSettingsStack} />
      <Stack.Screen name="changeMasterPassword" component={ChangeMasterPasswordScreen} />
      <Stack.Screen name="import" component={ImportScreen} />
      {/* <Stack.Screen name="autofillService" component={AutofillServiceScreen} /> */}
      <Stack.Screen name="export" component={ExportScreen} />
      <Stack.Screen name="emergencyAccess" component={EmergencyAccessStack} />
    </Stack.Navigator>
  )
})
