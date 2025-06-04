import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import { PasswordHealthRoute } from "app/navigators"
import {
  ExposedPasswordList,
  PasswordHealthScreen,
  ReusePasswordList,
  WeakPasswordListScreen,
} from "./screens"

const Stack = createStackNavigator<PasswordHealthRoute>()

export const PasswordHealthStack = observer(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="passwordHealth" component={PasswordHealthScreen} />
      <Stack.Screen name="reusePasswordList" component={ReusePasswordList} />
      <Stack.Screen name="weakPasswordList" component={WeakPasswordListScreen} />
      <Stack.Screen name="exposedPasswordList" component={ExposedPasswordList} />
    </Stack.Navigator>
  )
})
