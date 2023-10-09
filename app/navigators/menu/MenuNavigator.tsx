import React from 'react'
import { StackScreenProps, createStackNavigator } from '@react-navigation/stack'
import { MenuScreen } from '../../screens'
import { observer } from 'mobx-react-lite'

export type MenuParamList = {
  menu: undefined
}

export type MenuStackScreenProps<T extends keyof MenuParamList> = StackScreenProps<MenuParamList, T>

const Stack = createStackNavigator<MenuParamList>()

export const MenuNavigator = observer(() => {
  return (
    <Stack.Navigator
      initialRouteName="menu"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="menu" component={MenuScreen} />
    </Stack.Navigator>
  )
})
