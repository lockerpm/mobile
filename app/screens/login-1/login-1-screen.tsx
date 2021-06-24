import React from "react"
import { observer } from "mobx-react-lite"
import { SafeAreaView, View, ViewStyle } from "react-native"
import { Button, Screen, Text } from "../../components"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../theme"

const SECTION_PADDING: ViewStyle = {
  paddingVertical: spacing[2],
  paddingHorizontal: spacing[4]
}

export const Login1Screen = observer(function Login1Screen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  const navigation = useNavigation()

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView />

      <View style={[SECTION_PADDING, { flex: 1 }]}>
        <Text text="login" />
      </View>

      <SafeAreaView>
        <View style={SECTION_PADDING}>
          <Button
            text="Login"
            onPress={() => navigation.navigate("intro")}
          />
        </View>
      </SafeAreaView>
    </View>
  )
})
