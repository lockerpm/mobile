import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import {
  PasswordHealthScreen,
  WeakPasswordListScreen,
  ReusePasswordList,
  ExposedPasswordList,
  PrivateRelayStack,
} from "../../screens"
import { observer } from "mobx-react-lite"
import { ToolsRoute } from "../navigators.types"

const Stack = createNativeStackNavigator<ToolsRoute>()

export const ToolsNavigator = observer(() => {
  // ------------------ RENDER --------------------

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="passwordHealth" component={PasswordHealthScreen} />
      <Stack.Screen name="weakPasswordList" component={WeakPasswordListScreen} />
      <Stack.Screen name="reusePasswordList" component={ReusePasswordList} />
      <Stack.Screen name="exposedPasswordList" component={ExposedPasswordList} />

      <Stack.Screen name="privateRelay" component={PrivateRelayStack} />
    </Stack.Navigator>
  )
})
