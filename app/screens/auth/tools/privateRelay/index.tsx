import React from "react"
import { observer } from "mobx-react-lite"
import {
  AliasStatisticScreen,
  EditSubdomainScreen,
  ManageSubdomainScreen,
  PrivateRelay,
  RelayActionScreen,
  RelayInfoScreen,
} from "./screens"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { PrivateRelayRoute } from "app/navigators"

const Stack = createNativeStackNavigator<PrivateRelayRoute>()

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
