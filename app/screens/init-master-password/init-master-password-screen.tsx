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

  const { cryptoService, passwordGenerationService, storageService, secureStorageService } = useCoreService()

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
      <Button
        text="Store abc"
        onPress={() => storageService.save('abc', 123, undefined)}
      />
      <Button
        text="Get abc"
        onPress={async () => console.log(await storageService.get('abc', undefined))}
      />
      <Button
        text="Store abc with suffix"
        onPress={() => storageService.save('abc', 1234, { keySuffix: 'auto' })}
      />
      <Button
        text="Get abc with suffix"
        onPress={async () => console.log(await storageService.get('abc', { keySuffix: 'auto' }))}
      />
      <Button
        text="Store abc secure"
        onPress={() => secureStorageService.save('abc', 123, undefined)}
      />
      <Button
        text="Get abc secure"
        onPress={async () => console.log(await secureStorageService.get('abc', undefined))}
      />
      <Button
        text="Store abc with suffix secure"
        onPress={() => secureStorageService.save('abc', 1234, { keySuffix: 'auto' })}
      />
      <Button
        text="Get abc with suffix secure"
        onPress={async() => console.log(await secureStorageService.get('abc', { keySuffix: 'auto' }))}
      />
    </Screen>
  )
})
