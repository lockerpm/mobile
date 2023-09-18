import React from 'react'
import { StackScreenProps, createStackNavigator } from '@react-navigation/stack'
import {
  BrowseListScreen,
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
} from '../../screens'
import { SendView } from '../../../core/models/view/sendView'

export type BrowseParamList = {
  browseList: undefined
  folders: undefined
  cards: undefined
  passwords: undefined
  notes: undefined
  identities: undefined
  shares: undefined
  sharedItems: undefined
  quickShareItems: undefined
  quickShareItemsDetail: {
    send: SendView
  }
  shareItems: undefined
  trash: undefined
  cryptoWallets: undefined
}

export type BrowseStackScreenProps<T extends keyof BrowseParamList> = StackScreenProps<
  BrowseParamList,
  T
>

const Stack = createStackNavigator<BrowseParamList>()

export const BrowseNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="browseList"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="browseList" component={BrowseListScreen} />
      <Stack.Screen name="folders" component={FoldersScreen} />
      <Stack.Screen name="cards" component={CardsScreen} />
      <Stack.Screen name="passwords" component={PasswordsScreen} />
      <Stack.Screen name="notes" component={NotesScreen} />
      <Stack.Screen name="identities" component={IdentitiesScreen} />
      <Stack.Screen name="shares" component={SharesScreen} />
      <Stack.Screen name="sharedItems" component={SharedItemsScreen} />
      <Stack.Screen name="quickShareItems" component={QuickShareItemsScreen} />
      <Stack.Screen name="shareItems" component={ShareItemsScreen} />
      <Stack.Screen name="trash" component={TrashScreen} />
      <Stack.Screen name="cryptoWallets" component={CryptoAssetsScreen} />
    </Stack.Navigator>
  )
}
