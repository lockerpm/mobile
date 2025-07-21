import { observer } from "mobx-react-lite"
import {
  CreateMasterPasswordScreen,
  ForgotPasswordStack,
  IntroScreen,
  LoginStack,
  OnboardingScreen,
  SignupStack,
  SSOStack,
} from "./screens"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { UnAuthRoute } from "app/navigators"

const Stack = createNativeStackNavigator<UnAuthRoute>()

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
      <Stack.Screen name="ssoStack" component={SSOStack} />

      <Stack.Screen name="loginStack" component={LoginStack} />
      <Stack.Screen name="signupStack" component={SignupStack} />
      <Stack.Screen name="createMasterPassword" component={CreateMasterPasswordScreen} />
      <Stack.Screen name="forgotPasswordStack" component={ForgotPasswordStack} />
    </Stack.Navigator>
  )
})
