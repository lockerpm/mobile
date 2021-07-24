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

export const LoginScreen = observer(function LoginScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  const navigation = useNavigation()

  return (
    <Screen style={ROOT} preset="scroll">
      <Text preset="header" text="Login" />
      <Button
        text="Signup"
        onPress={() => navigation.navigate('signup')}
      />
      <Button
        text="Welcome back"
        onPress={() => navigation.navigate('lock')}
      />
      <Button
        text="Create master pass"
        onPress={() => navigation.navigate('createMasterPassword')}
      />
    </Screen>
  )
})
