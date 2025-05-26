import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import { UnAuthRoute } from "./route"
import {
  CreateMasterPasswordScreen,
  ForgotPasswordScreen,
  IntroScreen,
  LoginStack,
  OnboardingScreen,
  SignupStack,
  SSOStack,
} from "./screens"

const Stack = createStackNavigator<UnAuthRoute>()

export const UnAuthStack = observer(() => {
  // ------------------ RENDER --------------------

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="intro" component={IntroScreen} />
      <Stack.Screen name="onBoarding" component={OnboardingScreen} />
      <Stack.Screen name="loginStack" component={LoginStack} />
      <Stack.Screen name="signupStack" component={SignupStack} />
      <Stack.Screen name="ssoStack" component={SSOStack} />
      <Stack.Screen name="createMasterPassword" component={CreateMasterPasswordScreen} />
      <Stack.Screen name="forgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  )
})
export * from "./route"
