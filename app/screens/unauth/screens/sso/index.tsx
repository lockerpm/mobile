import React from "react"
import { SSOIdentifierScreen, SSOEmailLoginScreen } from "./screens"
import { createStackNavigator } from "@react-navigation/stack"
import { SSORoute } from "app/navigators"

const Stack = createStackNavigator<SSORoute>()

export const SSOStack = () => {
  // ------------------ RENDER --------------------

  return (
    <Stack.Navigator
      initialRouteName="ssoIdentifier"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ssoIdentifier" component={SSOIdentifierScreen} />
      <Stack.Screen name="ssoLogin" component={SSOEmailLoginScreen} />
    </Stack.Navigator>
  )
}
