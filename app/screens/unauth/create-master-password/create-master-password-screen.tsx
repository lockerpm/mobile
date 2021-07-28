import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Screen, Text, Button, OverlayLoading } from "../../../components"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color } from "../../../theme"
import { useMixins } from "../../../services/mixins"

const ROOT: ViewStyle = {
  backgroundColor: color.palette.black,
  flex: 1,
}

export const CreateMasterPasswordScreen = observer(function CreateMasterPasswordScreen() {
  // const { someStore, anotherStore } = useStores()
  const { logout } = useMixins()
  const navigation = useNavigation()

  // Params
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Screen style={ROOT} preset="scroll">
      {
        isLoading && (
          <OverlayLoading />
        )
      }
      <Text preset="header" text="Create master pass" />
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
