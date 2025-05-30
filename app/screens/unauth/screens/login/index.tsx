import React from "react"
import { observer } from "mobx-react-lite"
import { LoginScreen, PinCodeLoginScreen } from "./screens"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { LoginRoute } from "app/navigators"
import { LOGIN_METHOD } from "app/static/types"

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
      <Stack.Screen
        name="login"
        component={LoginScreen}
        initialParams={{ initMethod: LOGIN_METHOD.NONE, email: "" }}
      />
      <Stack.Screen name="loginByPincode" component={PinCodeLoginScreen} />
    </Stack.Navigator>
  )
})
