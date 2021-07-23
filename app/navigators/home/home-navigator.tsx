import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { AllItemScreen } from "../../screens"

const Stack = createStackNavigator()

export const HomeNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="allItem"
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="allItem" component={AllItemScreen} />
    </Stack.Navigator>
  )
}

