import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import {
  FoldersScreen,
  CardsScreen,
  PasswordsScreen,
  NotesScreen,
  IdentitiesScreen,
  SharesScreen,
  TrashScreen,
  ShareItemsScreen,
  SharedItemsScreen,
  CryptoAssetsScreen,
  QuickShareItemsScreen,
  AuthenticatorEditScreen,
  NormalSharesScreen,
  QuickSharesScreen,
  QuickSharesDetailScreen,
  PasswordInfoScreen,
  PasswordEditScreen,
  Password2FASetupScreen,
  PasswordHistoryScreen,
  NoteInfoScreen,
  NoteEditScreen,
  CardInfoScreen,
  CardEditScreen,
  IdentityInfoScreen,
  IdentityEditScreen,
  FolderSelectScreen,
  FolderCiphersScreen,
  FolderSharedUsersManagementScreen,
  ShareMultipleScreen,
  CryptoWalletInfoScreen,
  CryptoWalletEditScreen,
  AttachmentScreen,
} from "./screens"
import { observer } from "mobx-react-lite"
import { BrowseRoute } from "app/navigators"

const Stack = createStackNavigator<BrowseRoute>()

export const BrowseStack = observer(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="folders" component={FoldersScreen} />
      <Stack.Screen name="cards" component={CardsScreen} />
      <Stack.Screen name="passwords" component={PasswordsScreen} />
      <Stack.Screen name="notes" component={NotesScreen} />
      <Stack.Screen name="identities" component={IdentitiesScreen} />
      <Stack.Screen name="trash" component={TrashScreen} />
      <Stack.Screen name="cryptoWallets" component={CryptoAssetsScreen} />
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

      <Stack.Screen name="passwordsInfo" component={PasswordInfoScreen} />
      <Stack.Screen
        name="passwordsEdit"
        component={PasswordEditScreen}
        initialParams={{ mode: "add" }}
      />
      <Stack.Screen name="passwords2faSetup" component={Password2FASetupScreen} />
      <Stack.Screen name="passwordsHistory" component={PasswordHistoryScreen} />

      <Stack.Screen name="notesInfo" component={NoteInfoScreen} />
      <Stack.Screen name="notesEdit" component={NoteEditScreen} initialParams={{ mode: "add" }} />
      <Stack.Screen name="cardsInfo" component={CardInfoScreen} />
      <Stack.Screen name="cardsEdit" component={CardEditScreen} initialParams={{ mode: "add" }} />
      <Stack.Screen name="identitiesInfo" component={IdentityInfoScreen} />
      <Stack.Screen
        name="identitiesEdit"
        component={IdentityEditScreen}
        initialParams={{ mode: "add" }}
      />

      <Stack.Screen
        name="foldersSelect"
        component={FolderSelectScreen}
        initialParams={{ mode: "add" }}
      />
      <Stack.Screen name="foldersCiphers" component={FolderCiphersScreen} />
      <Stack.Screen name="shareFolder" component={FolderSharedUsersManagementScreen} />
      <Stack.Screen name="shareMultiple" component={ShareMultipleScreen} />
      <Stack.Screen name="cryptoWalletsInfo" component={CryptoWalletInfoScreen} />
      <Stack.Screen
        name="cryptoWalletsEdit"
        component={CryptoWalletEditScreen}
        initialParams={{ mode: "add" }}
      />
      <Stack.Screen name="attachment" component={AttachmentScreen} />
    </Stack.Navigator>
  )
})
