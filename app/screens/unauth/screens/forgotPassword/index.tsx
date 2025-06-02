import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { ForgotPasswordRoute } from "app/navigators"
import {
  ForgotChangePasswordScreen,
  ForgotMethodSelectScreen,
  ForgotOtpAuthenScreen,
} from "./screens"

const Stack = createStackNavigator<ForgotPasswordRoute>()

export const ForgotPasswordStack = () => {
  // ------------------ RENDER --------------------

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="methodSelect" component={ForgotMethodSelectScreen} />
      <Stack.Screen name="otp" component={ForgotOtpAuthenScreen} />
      <Stack.Screen name="changePassword" component={ForgotChangePasswordScreen} />
    </Stack.Navigator>
  )
}
