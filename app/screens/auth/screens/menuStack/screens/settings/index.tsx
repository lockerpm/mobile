import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"

import { SettingsRoute, modalScreenOptions } from "app/navigators"

import {
  ChangeMasterPasswordScreen,
  EncryptionKeyScreen,
  ExportScreen,
  ImportScreen,
  NotificationSettingsStack,
  PasskeyCreateModalScreen,
  PasskeyDeleteModalScreen,
  PasskeyListScreen,
  SettingsScreen,
  VerifyMasterPasswordScreen,
  VerifyPasskeyScreen,
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
      <Stack.Screen name="verifyPasskey" component={VerifyPasskeyScreen} />
      <Stack.Screen name="unlockPasskeys" component={PasskeyListScreen} />
      <Stack.Group screenOptions={modalScreenOptions}>
        <Stack.Screen name="unlockPasskeyCreate" component={PasskeyCreateModalScreen} />
        <Stack.Screen name="unlockPasskeyDelete" component={PasskeyDeleteModalScreen} />
      </Stack.Group>
    </Stack.Navigator>
  )
})
