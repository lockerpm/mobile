import { observer } from "mobx-react-lite"
import {
  AliasStatisticScreen,
  CreateSubdomainScreen,
  EditSubdomainScreen,
  ManageSubdomainScreen,
  PrivateRelay,
  RelayActionScreen,
  RelayInfoScreen,
} from "./screens"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { modalScreenOptions, PrivateRelayRoute } from "app/navigators"

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
      <Stack.Group screenOptions={modalScreenOptions}>
        <Stack.Screen name="relayInfo" component={RelayInfoScreen} />
        <Stack.Screen name="relayAction" component={RelayActionScreen} />
        <Stack.Screen name="editSubdomain" component={EditSubdomainScreen} />
        <Stack.Screen name="createSubdomain" component={CreateSubdomainScreen} />
      </Stack.Group>

      <Stack.Screen name="relay" component={PrivateRelay} />

      <Stack.Screen name="manageSubdomain" component={ManageSubdomainScreen} />
      <Stack.Screen name="aliasStatistic" component={AliasStatisticScreen} />
    </Stack.Navigator>
  )
})
