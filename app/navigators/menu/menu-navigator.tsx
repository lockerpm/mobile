import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { MenuScreen } from "../../screens"


const Stack = createStackNavigator()

export const MenuNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="menu"
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="menu" component={MenuScreen} />
    </Stack.Navigator>
  )
}

