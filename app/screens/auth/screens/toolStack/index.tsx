import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import { ToolsRoute } from "app/navigators"
import {
  DataBreachScannerStack,
  PasswordGeneratorScreen,
  PasswordHealthStack,
  PrivateRelayStack,
} from "./screens"

const Stack = createNativeStackNavigator<ToolsRoute>()

export const ToolStack = observer(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="passwordGenerator" component={PasswordGeneratorScreen} />
      <Stack.Screen name="passwordHealthStack" component={PasswordHealthStack} />
      <Stack.Screen name="privateRelayStack" component={PrivateRelayStack} />
      <Stack.Screen name="dataBreachScannerStack" component={DataBreachScannerStack} />
    </Stack.Navigator>
  )
})
