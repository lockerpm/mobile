import React from "react"
import { observer } from "mobx-react-lite"
import { SSORoute } from "./route"
import { SSOIdentifierScreen, SSOEmailLoginScreen } from "./screens"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

const Stack = createNativeStackNavigator<SSORoute>()

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
