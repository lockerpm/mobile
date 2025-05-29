import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import { EmergencyAccessRoute } from "./route"
import {
  ContactsTrustedYouScreen,
  EmergencyAccessScreen,
  TakeoverEAScreen,
  ViewEAScreen,
  YourTrustedContactScreen,
} from "./screens"

const Stack = createNativeStackNavigator<EmergencyAccessRoute>()

export const EmergencyAccessStack = observer(() => {
  // ------------------ RENDER --------------------

  return (
    <Stack.Navigator
      initialRouteName="emergencyOptions"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="emergencyOptions" component={EmergencyAccessScreen} />
      <Stack.Screen name="yourTrustedContact" component={YourTrustedContactScreen} />
      <Stack.Screen name="contactsTrustedYou" component={ContactsTrustedYouScreen} />
      <Stack.Screen name="viewEA" component={ViewEAScreen} />
      <Stack.Screen name="takeoverEA" component={TakeoverEAScreen} />
    </Stack.Navigator>
  )
})
