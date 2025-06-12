import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import {
  AuthenticatorEditScreen,
  Password2FASetupScreen,
  PasswordHistoryScreen,
  FolderSelectScreen,
  AttachmentScreen,
  CipherDetailScreen,
  CipherEditScreen,
  FolderListScreen,
  ShareStack,
} from "./screens"
import { observer } from "mobx-react-lite"
import { BrowseRoute } from "app/navigators"
import { CipherListScreen } from "./screens/cipherList"

const Stack = createStackNavigator<BrowseRoute>()

export const BrowseStack = observer(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="attachment" component={AttachmentScreen} />

      <Stack.Screen name="cipherList" component={CipherListScreen} />
      <Stack.Screen name="cipherEdit" component={CipherEditScreen} />
      <Stack.Screen name="cipherDetail" component={CipherDetailScreen} />
      <Stack.Screen name="folderList" component={FolderListScreen} />
      <Stack.Screen name="shareStack" component={ShareStack} />

      {/** TODO */}
      <Stack.Screen
        name="authenticatorEdit"
        component={AuthenticatorEditScreen}
        initialParams={{ mode: "add" }}
      />
      <Stack.Screen name="passwords2faSetup" component={Password2FASetupScreen} />
      <Stack.Screen name="passwordsHistory" component={PasswordHistoryScreen} />

      <Stack.Screen
        name="foldersSelect"
        component={FolderSelectScreen}
        initialParams={{ mode: "add" }}
      />
    </Stack.Navigator>
  )
})
