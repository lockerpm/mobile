import React from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Screen, Text, Button } from "../../../components"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../../models"
import { color } from "../../../theme"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

export const StartScreen = observer(function StartScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  const navigation = useNavigation()

  return (
    <Screen style={ROOT} preset="scroll">
      <Text preset="header" text="Start " />
      <Button
        text="Switch device"
        onPress={() => navigation.navigate('switchDevice')}
      />
      <Button
        text="Biometric"
        onPress={() => navigation.navigate('biometricUnlockIntro')}
      />
    </Screen>
  )
})
