import { SSOIdentifierScreen, SSOEmailLoginScreen } from "./screens"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { SSORoute } from "app/navigators"

const Stack = createNativeStackNavigator<SSORoute>()

export const SSOStack = () => {
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
}
