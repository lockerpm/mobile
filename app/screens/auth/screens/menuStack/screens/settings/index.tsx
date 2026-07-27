import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"

import { SettingsRoute } from "app/navigators"

import {
  ChangeMasterPasswordScreen,
  EncryptionKeyScreen,
  ExportScreen,
  ImportScreen,
  NotificationSettingsStack,
  SettingsScreen,
  VerifyMasterPasswordScreen,
} from "./screens"
// @ts-ignore
import { AutofillServiceScreen } from "./screens/autofillService/AutofillServiceScreen"

const Stack = createNativeStackNavigator<SettingsRoute>()

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
      <Stack.Screen name="encryptionKey" component={EncryptionKeyScreen} />
      <Stack.Screen name="verifyMasterPassword" component={VerifyMasterPasswordScreen} />
    </Stack.Navigator>
  )
})
