import { observer } from "mobx-react-lite"
import { LoginScreen, PinCodeLoginScreen, TwoFAAuthenScreen } from "./screens"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { LoginRoute, modalScreenOptions } from "app/navigators"
import { LoginOptions } from "app/static/types"

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
        initialParams={{ initMethod: LoginOptions.NONE, email: "" }}
      />
      <Stack.Screen name="loginByPincode" component={PinCodeLoginScreen} />
      <Stack.Screen name="twoFA" component={TwoFAAuthenScreen} options={modalScreenOptions} />
    </Stack.Navigator>
  )
})
