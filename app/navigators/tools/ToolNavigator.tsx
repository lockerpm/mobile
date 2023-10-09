import React from 'react'
import { StackScreenProps, createStackNavigator } from '@react-navigation/stack'
import {
  PasswordHealthScreen,
  WeakPasswordListScreen,
  ReusePasswordList,
  ExposedPasswordList,
  PrivateRelay,
  ManageSubdomainScreen,
  AliasStatisticScreen,
} from '../../screens'
import { TxKeyPath } from 'app/i18n'
import { ImageIconTypes } from 'app/components/cores'
import { RelayAddress, SubdomainData } from 'app/static/types'
import { observer } from 'mobx-react-lite'

// ------------------------Tools list screen routing---------------------
export type ToolsItem = {
  label: TxKeyPath
  desc: TxKeyPath
  icon: ImageIconTypes
  routeName: string
  premium?: boolean
}

type ToolsItemContainer = {
  passwordGenerator: ToolsItem
  authenticator: ToolsItem
  privateRelay: ToolsItem
  passwordHealth: ToolsItem
  dataBreachScanner: ToolsItem
}

export const TOOLS_ITEMS: ToolsItemContainer = {
  passwordGenerator: {
    label: 'pass_generator.title',
    desc: 'pass_generator.desc',
    icon: 'password-generator',
    routeName: 'passwordGenerator',
  },
  privateRelay: {
    label: 'private_relay.title',
    desc: 'private_relay.tool',
    icon: 'private-relay',
    routeName: 'privateRelay',
  },
  authenticator: {
    label: 'authenticator.title',
    desc: 'authenticator.desc',
    icon: 'authenticator',
    routeName: 'authenticator',
  },
  passwordHealth: {
    label: 'pass_health.title',
    desc: 'pass_health.desc',
    icon: 'password-health',
    routeName: 'passwordHealth',
    premium: true,
  },
  dataBreachScanner: {
    label: 'data_breach_scanner.title',
    desc: 'data_breach_scanner.desc',
    icon: 'data-breach-scanner',
    routeName: 'dataBreachScanner',
    premium: true,
  },
}

// ------------------------Tools stack navigation---------------------

export type ToolsParamList = {
  passwordHealth: undefined
  weakPasswordList: undefined
  reusePasswordList: undefined
  exposedPasswordList: undefined
  privateRelay: undefined
  manageSubdomain: {
    subdomain: SubdomainData
  }
  aliasStatistic: {
    alias: RelayAddress
  }
}

export type ToolsStackScreenProps<T extends keyof ToolsParamList> = StackScreenProps<
  ToolsParamList,
  T
>

const Stack = createStackNavigator<ToolsParamList>()

export const ToolsNavigator = observer(() => {
  // ------------------ RENDER --------------------

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="passwordHealth" component={PasswordHealthScreen} />
      <Stack.Screen name="weakPasswordList" component={WeakPasswordListScreen} />
      <Stack.Screen name="reusePasswordList" component={ReusePasswordList} />
      <Stack.Screen name="exposedPasswordList" component={ExposedPasswordList} />
      <Stack.Screen name="privateRelay" component={PrivateRelay} />
      <Stack.Screen name="manageSubdomain" component={ManageSubdomainScreen} />
      <Stack.Screen name="aliasStatistic" component={AliasStatisticScreen} />
    </Stack.Navigator>
  )
})
