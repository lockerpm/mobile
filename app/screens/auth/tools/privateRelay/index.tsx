import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { observer } from "mobx-react-lite"
import { PrivateRelayRoute } from "./route"
import {
  AliasStatisticScreen,
  EditSubdomainScreen,
  ManageSubdomainScreen,
  PrivateRelay,
  RelayActionScreen,
  RelayInfoScreen,
} from "./screens"

const Stack = createStackNavigator<PrivateRelayRoute>()

export const PrivateRelayStack = observer(() => {
  // ------------------ RENDER --------------------

  return (
    <Stack.Navigator
      initialRouteName="relay"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="relay" component={PrivateRelay} />
      <Stack.Screen
        name="relayInfo"
        component={RelayInfoScreen}
        options={{
          presentation: "transparentModal",
        }}
      />
      <Stack.Screen
        name="relayAction"
        component={RelayActionScreen}
        options={{
          presentation: "transparentModal",
        }}
      />

      <Stack.Screen
        name="editSubdomain"
        component={EditSubdomainScreen}
        options={{
          presentation: "transparentModal",
        }}
      />

      <Stack.Screen name="manageSubdomain" component={ManageSubdomainScreen} />
      <Stack.Screen name="aliasStatistic" component={AliasStatisticScreen} />
    </Stack.Navigator>
  )
})
