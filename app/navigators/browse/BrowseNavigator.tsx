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
import { SendView } from 'core/models/view/sendView'
import { TxKeyPath } from 'app/i18n'
import { ImageSourcePropType, ImageURISource } from 'react-native'

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

export type BrowseItem = {
  label: TxKeyPath
  icon: ImageSourcePropType & ImageURISource
  routeName: string
  addable?: boolean
  group?: string
}

type BrowseItemContainer = {
  [name: string]: BrowseItem
}

export const BROWSE_ITEMS: BrowseItemContainer = {
  folder: {
    label: 'common.folders',
    icon: require('assets/images/icons/vault/folder.png'),
    routeName: 'folders',
  },
  password: {
    label: 'common.passwords',
    icon: require('assets/images/icons/vault/password.png'),
    routeName: 'passwords',
    addable: true,
  },
  note: {
    label: 'common.note',
    icon: require('assets/images/icons/vault/note.png'),
    routeName: 'notes',
    addable: true,
  },
  card: {
    label: 'common.card',
    icon: require('assets/images/icons/vault/card.png'),
    routeName: 'cards',
    addable: true,
  },
  cryptoWallet: {
    label: 'common.crypto_wallet',
    icon: require('assets/images/icons/vault/crypto-wallet.png'),
    routeName: 'cryptoWallets',
    addable: true,
  },
  identity: {
    label: 'common.identity',
    icon: require('assets/images/icons/vault/info.png'),
    routeName: 'identities',
    addable: true,
  },
  shares: {
    label: 'shares.shares',
    icon: require('assets/images/icons/vault/shared.png'),
    routeName: 'shares',
  },
  trash: {
    label: 'common.trash',
    icon: require('assets/images/icons/vault/trash.png'),
    routeName: 'trash',
  },
}
