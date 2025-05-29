import React from "react"
import { observer } from "mobx-react-lite"
import { LoginRoute } from "./route"
import { LoginScreen, PinCodeLoginScreen } from "./screens"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

const Stack = createNativeStackNavigator<LoginRoute>()

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
