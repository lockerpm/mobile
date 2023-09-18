import React from 'react'
import { StackScreenProps, createStackNavigator } from '@react-navigation/stack'
import {
  PasswordHealthScreen,
  WeakPasswordList,
  ReusePasswordList,
  ExposedPasswordList,
} from '../../screens'

import { observer } from 'mobx-react-lite'

export type ToolsParamList = {
  passwordHealth: undefined
  weakPasswordList: undefined
  reusePasswordList: undefined
  exposedPasswordList: undefined
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
      initialRouteName="passwordHealth"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="passwordHealth" component={PasswordHealthScreen} />
      <Stack.Screen name="weakPasswordList" component={WeakPasswordList} />
      <Stack.Screen name="reusePasswordList" component={ReusePasswordList} />
      <Stack.Screen name="exposedPasswordList" component={ExposedPasswordList} />
    </Stack.Navigator>
  )
})
