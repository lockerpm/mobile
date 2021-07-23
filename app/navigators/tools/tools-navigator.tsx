import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { 
  ToolsListScreen, PasswordGeneratorScreen, PasswordHealthScreen,
  DataBreachScannerScreen
} from "../../screens"

const Stack = createStackNavigator()

export const ToolsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="toolsList"
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="toolsList" component={ToolsListScreen} />
      <Stack.Screen name="passwordGenerator" component={PasswordGeneratorScreen} />
      <Stack.Screen name="passwordHealth" component={PasswordHealthScreen} />
      <Stack.Screen name="dataBreachScanner" component={DataBreachScannerScreen} />
    </Stack.Navigator>
  )
}
