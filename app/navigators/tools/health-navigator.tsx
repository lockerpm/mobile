import React from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { 
  PasswordHealthScreen, WeakPasswordList, ReusePasswordList, ExposedPasswordList
} from "../../screens"

import { observer } from "mobx-react-lite"

export type HealthParamList = {
  passwordHealth: undefined
  weakPasswordList: undefined
  reusePasswordList: undefined
  exposedPasswordList: undefined
}

const Stack = createStackNavigator<HealthParamList>()

export const HealthNavigator = observer(() => {

  // ------------------ RENDER --------------------
  
  return (
    <Stack.Navigator
      initialRouteName="passwordHealth"
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="passwordHealth" component={PasswordHealthScreen} />
      <Stack.Screen name="weakPasswordList" component={WeakPasswordList} />
      <Stack.Screen name="reusePasswordList" component={ReusePasswordList} />
      <Stack.Screen name="exposedPasswordList" component={ExposedPasswordList} />
    </Stack.Navigator>
  )
})
