import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, TextInput } from "react-native"
import { Screen, Text, Button, OverlayLoading } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { color } from "../../../theme"
import { useMixins } from "../../../services/mixins"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.white,
  flex: 1
}

export const LockScreen = observer(function LockScreen() {
  const navigation = useNavigation()
  const { logout, sessionLogin, notify } = useMixins()
  const { user } = useStores()

  // Params
  const [masterPassword, setMasterPassword] = useState('11$23581321Duc')
  const [isLoading, setIsLoading] = useState(false)
  
  return (
    <Screen style={ROOT} preset="scroll">
      {
        isLoading && (
          <OverlayLoading />
        )
      }
      <Text preset="header" text="Lock" />
      <Text preset="secondary" text={"Hello " + user.username} />
      <TextInput
        onChangeText={setMasterPassword}
        value={masterPassword}
        secureTextEntry
      />
      <Button
        text="Unlock"
        onPress={async () => {
          if (masterPassword) {
            setIsLoading(true)
            const res = await sessionLogin(masterPassword)
            setIsLoading(false)
            if (res.kind === 'ok') {
              navigation.navigate('mainStack')
            } else if (res.kind === 'unauthorized') {
              navigation.navigate('login')
            }
          } else {
            notify('error', 'Missing data', 'Enter password pls')
          }
        }}
      />
      <Button
        text="Logout"
        onPress={async () => {
          setIsLoading(true)
          await logout()
          setIsLoading(false)
          navigation.navigate('onBoarding')
        }}
      />
    </Screen>
  )
})
