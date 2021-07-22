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

  const { cryptoService, passwordGenerationService } = useCoreService()

  const createMasterPassword = async (email : string, password : string) => {
    const kdf = KdfType.PBKDF2_SHA256
    const kdfIterations = 5000
    const key = await cryptoService.makeKey(password, email, kdf, kdfIterations)
    const encKey = await cryptoService.makeEncKey(key)
    const hashedPassword = await cryptoService.hashPassword(password, key)
    const keys = await cryptoService.makeKeyPair(encKey[0])
    const payload = {
      email,
      kdf,
      kdfIterations,
      masterPasswordHash: hashedPassword,
      key: encKey[1].encryptedString,
      keys: {
        publicKey: keys[0],
        privateKey: keys[1].encryptedString
      }
    }
    console.log(payload)
  }

  const evaluatePassword = async (password: string) => {
    const passwordStrength = passwordGenerationService.passwordStrength(password)
    console.log(passwordStrength)
  }

  return (
    <Screen style={ROOT} preset="scroll">
      <Text preset="header" text="Create master password" />
      <Button
        text="TEST"
        onPress={() => createMasterPassword('test@gmail.com', '12345678')}
      />
      <Button
        text="TEST 2"
        onPress={() => evaluatePassword('12345678')}
      />
    </Screen>
  )
})
