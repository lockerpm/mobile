import React from "react"
import { observer } from "mobx-react-lite"
import { SignupScreen, SignUpWithPassword, SignUpWithPinCode } from "./screens"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { SignupRoute } from "app/navigators"

const Stack = createNativeStackNavigator<SignupRoute>()

export const SignupStack = observer(() => {
  // ------------------ RENDER --------------------

  return (
    <Stack.Navigator
      initialRouteName="signup"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="signup" component={SignupScreen} />
      <Stack.Screen name="signupPinCode" component={SignUpWithPinCode} />
      <Stack.Screen name="signupPassword" component={SignUpWithPassword} />
    </Stack.Navigator>
  )
})
