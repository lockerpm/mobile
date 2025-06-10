import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import {
  FoldersScreen,
  SharesScreen,
  TrashScreen,
  ShareItemsScreen,
  SharedItemsScreen,
  QuickShareItemsScreen,
  AuthenticatorEditScreen,
  NormalSharesScreen,
  QuickSharesScreen,
  QuickSharesDetailScreen,
  Password2FASetupScreen,
  PasswordHistoryScreen,
  FolderSelectScreen,
  FolderCiphersScreen,
  FolderSharedUsersManagementScreen,
  ShareMultipleScreen,
  AttachmentScreen,
  CipherDetailScreen,
  CipherEditScreen,
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
      <Stack.Screen name="cipherList" component={CipherListScreen} />
      <Stack.Screen name="cipherEdit" component={CipherEditScreen} />
      <Stack.Screen name="cipherDetail" component={CipherDetailScreen} />

      {/** OLD */}

      <Stack.Screen name="folders" component={FoldersScreen} />
      <Stack.Screen name="trash" component={TrashScreen} />
      <Stack.Screen name="shares" component={SharesScreen} />
      <Stack.Screen name="sharedItems" component={SharedItemsScreen} />
      <Stack.Screen name="shareItems" component={ShareItemsScreen} />
      <Stack.Screen name="quickShareItems" component={QuickShareItemsScreen} />

      {/** TODO */}
      <Stack.Screen
        name="authenticatorEdit"
        component={AuthenticatorEditScreen}
        initialParams={{ mode: "add" }}
      />
      <Stack.Screen
        name="normalShares"
        component={NormalSharesScreen}
        initialParams={{ ciphers: [] }}
      />

      <Stack.Screen name="quickShares" component={QuickSharesScreen} />
      <Stack.Screen name="quickShareItemsDetail" component={QuickSharesDetailScreen} />

      <Stack.Screen name="passwords2faSetup" component={Password2FASetupScreen} />
      <Stack.Screen name="passwordsHistory" component={PasswordHistoryScreen} />

      <Stack.Screen
        name="foldersSelect"
        component={FolderSelectScreen}
        initialParams={{ mode: "add" }}
      />
      <Stack.Screen name="foldersCiphers" component={FolderCiphersScreen} />
      <Stack.Screen name="shareFolder" component={FolderSharedUsersManagementScreen} />
      <Stack.Screen name="shareMultiple" component={ShareMultipleScreen} />

      <Stack.Screen name="attachment" component={AttachmentScreen} />
    </Stack.Navigator>
  )
})
