import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import { SSORoute } from "./route"
import { SSOIdentifierScreen, SSOEmailLoginScreen } from "./screens"

const Stack = createStackNavigator<SSORoute>()

export const SSOStack = observer(() => {
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
})
