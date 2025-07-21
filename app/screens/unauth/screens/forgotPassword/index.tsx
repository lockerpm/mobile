import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { ForgotPasswordRoute } from "app/navigators"
import {
  ForgotChangePasswordScreen,
  ForgotMethodSelectScreen,
  ForgotOtpAuthenScreen,
} from "./screens"

const Stack = createNativeStackNavigator<ForgotPasswordRoute>()

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
