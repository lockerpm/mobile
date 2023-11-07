import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { MenuScreen } from "../../screens"
import { observer } from "mobx-react-lite"
import { MenuParamList } from "../navigators.types"

const Stack = createStackNavigator<MenuParamList>()

export const MenuNavigator = observer(() => {
  return (
    <Stack.Navigator
      initialRouteName="menu"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="menu" component={MenuScreen} />
    </Stack.Navigator>
  )
})
