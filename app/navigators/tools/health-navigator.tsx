import React, { useEffect } from "react"
import { createStackNavigator } from "@react-navigation/stack"
import { 
  PasswordHealthScreen, WeakPasswordList, ReusePasswordList, ExposedPasswordList
} from "../../screens"
import { useStores } from "../../models"
import { observer } from "mobx-react-lite"
import { useCipherToolsMixins } from "../../services/mixins/cipher/tools"
import { AppEventType, EventBus } from "../../utils/event-bus"
import { PasswordHealthQueue } from "../../utils/queue"


export type HealthParamList = {
  passwordHealth: undefined
  weakPasswordList: undefined
  reusePasswordList: undefined
  exposedPasswordList: undefined
}

const Stack = createStackNavigator<HealthParamList>()

export const HealthNavigator = observer(() => {
  const { toolStore } = useStores()
  const { loadPasswordsHealth } = useCipherToolsMixins()

  // ------------------ PARAMS --------------------

  // ------------------ METHODS --------------------

  // ------------------ EFFECT --------------------

  // First load
  useEffect(() => {
    if (!toolStore.lastHealthCheck) {
      PasswordHealthQueue.clear()
      PasswordHealthQueue.add(loadPasswordsHealth)
    }
  }, [toolStore.lastHealthCheck])

  // Recalculate password health
  useEffect(() => {
    const listener = EventBus.createListener(AppEventType.PASSWORD_UPDATE, () => {
      PasswordHealthQueue.clear()
      PasswordHealthQueue.add(loadPasswordsHealth)
    })
    return () => {
      EventBus.removeListener(listener)
    }
  }, [])

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
