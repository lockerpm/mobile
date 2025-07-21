import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { observer } from "mobx-react-lite"
import { AndroidAutofillRoute, modalScreenOptions } from "app/navigators"
import {
  AndroidAutofillCipherActionsModalScreen,
  AndroidAutofillPasswordGenModalScreen,
  AndroidAutofillScreen,
} from "./screen"

const Stack = createNativeStackNavigator<AndroidAutofillRoute>()

export const AndroidAutofillStack = observer(() => {
  return (
    <Stack.Navigator
      initialRouteName="passwordList"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="passwordList" component={AndroidAutofillScreen} />
      <Stack.Group screenOptions={modalScreenOptions}>
        <Stack.Screen
          name="passwordActionsModal"
          component={AndroidAutofillCipherActionsModalScreen}
        />
        <Stack.Screen name="passwordGenModal" component={AndroidAutofillPasswordGenModalScreen} />
      </Stack.Group>
    </Stack.Navigator>
  )
})
