import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import { LoginRoute } from "./route"
import { LoginScreen, PinCodeLoginScreen } from "./screens"

const Stack = createStackNavigator<LoginRoute>()

export const LoginStack = observer(() => {
  // ------------------ RENDER --------------------

  return (
    <Stack.Navigator
      initialRouteName="login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="loginByPincode" component={PinCodeLoginScreen} />
    </Stack.Navigator>
  )
})
