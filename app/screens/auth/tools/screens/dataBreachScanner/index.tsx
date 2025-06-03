import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import { DataBreachScannerRoute } from "app/navigators"
import { DataBreachDetailScreen, DataBreachEmailInputScreen, DataBreachListScreen } from "./screens"

const Stack = createStackNavigator<DataBreachScannerRoute>()

export const DataBreachScannerStack = observer(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="emailInput" component={DataBreachEmailInputScreen} />
      <Stack.Screen name="dataBreachList" component={DataBreachListScreen} />
      <Stack.Screen name="dataBreachDetail" component={DataBreachDetailScreen} />
    </Stack.Navigator>
  )
})
