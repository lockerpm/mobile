import React from "react"
import { observer } from "mobx-react-lite"
import { SafeAreaView, View, ViewStyle } from "react-native"
import { AutoImage as Image, Button, Text } from "../../../components"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { color, spacing } from "../../../theme"

const SECTION_PADDING: ViewStyle = {
  paddingVertical: spacing[2],
  paddingHorizontal: spacing[4],
}

export const OnboardingScreen = observer(function OnboardingScreen() {
  // Pull in one of our MST stores
  // const { someStore, anotherStore } = useStores()

  // Pull in navigation via hook
  const navigation = useNavigation()

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView />

      <View style={[SECTION_PADDING, { flex: 1, justifyContent: "center", alignItems: "center" }]}>
        <Image source={require("./logo.png")} />
        <Text
          text="Your daily needs"
          style={{ fontSize: 14, marginTop: 31, color: color.palette.blackTitle }}
        />
      </View>

      <SafeAreaView>
        <View style={SECTION_PADDING}>
          <Button text="Login" onPress={() => navigation.navigate("login")} />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 12,
          }}
        >
          <Text
            text="Don't have an account?"
            style={{
              fontSize: 14,
              marginRight: 8,
            }}
          />
          <Button
            preset="link"
            text="Sign up"
            textStyle={{ color: color.palette.green, fontSize: 14 }}
            onPress={() => navigation.navigate("signup")}
          />
        </View>
      </SafeAreaView>
    </View>
  )
})
