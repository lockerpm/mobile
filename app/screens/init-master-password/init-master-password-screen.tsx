import React from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Screen, Text, Button } from "../../components"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from "../../theme"
import { useCoreService } from "../../services/core-service"
import { KdfType } from "../../../core/enums/kdfType"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.white,
  flex: 1,
}

export const InitMasterPasswordScreen = observer(function InitMasterPasswordScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  // const navigation = useNavigation()

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { cryptoService } = useCoreService()

  const createMasterPassword = async (email : string, password : string) => {
    const kdf = KdfType.PBKDF2_SHA256
    const kdfIterations = 5000
    const key = await cryptoService.makeKey(password, email, kdf, kdfIterations)
    console.log(typeof key)
    console.log(key)
    // console.log(email + password)
  }

  return (
    <Screen style={ROOT} preset="scroll">
      <Text preset="header" text="Create master password" />
      <Button
        text="TEST"
        onPress={() => createMasterPassword('test@gmail.com', '12345678')}
      />
    </Screen>
  )
})
