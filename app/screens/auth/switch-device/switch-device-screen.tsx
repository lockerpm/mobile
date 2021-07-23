import React from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Screen, Text, Button } from "../../../components"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from "../../../theme"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

export const SwitchDeviceScreen = observer(function SwitchDeviceScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  const navigation = useNavigation()

  return (
    <Screen style={ROOT} preset="scroll">
      <Text preset="header" text="" />
      <Button
        text="Biometric"
        onPress={() => navigation.navigate('biometricUnlockIntro')}
      />
      <Button
        text="App"
        onPress={() => navigation.navigate('mainTab')}
      />
    </Screen>
  )
})
