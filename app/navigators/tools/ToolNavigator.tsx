import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import {
  PasswordHealthScreen,
  WeakPasswordListScreen,
  ReusePasswordList,
  ExposedPasswordList,
  PrivateRelay,
  ManageSubdomainScreen,
  AliasStatisticScreen,
} from "../../screens"
import { observer } from "mobx-react-lite"
import { ToolsParamList } from "../navigators.types"

const Stack = createStackNavigator<ToolsParamList>()

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
      <Stack.Screen name="privateRelay" component={PrivateRelay} />
      <Stack.Screen name="manageSubdomain" component={ManageSubdomainScreen} />
      <Stack.Screen name="aliasStatistic" component={AliasStatisticScreen} />
    </Stack.Navigator>
  )
})
