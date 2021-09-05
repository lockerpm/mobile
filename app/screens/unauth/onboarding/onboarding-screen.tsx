import React from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { AutoImage as Image, Button, Layout, Text } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles } from "../../../theme"

export const OnboardingScreen = observer(function OnboardingScreen() {
  const navigation = useNavigation()

  // Child components
  const footer = (
    <View>
      <Button text="Login" onPress={() => navigation.navigate("login")} />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 12,
        }}
      >
        <Text
          tx="onBoarding.no_account"
          style={{
            fontSize: 14,
            marginRight: 8,
          }}
        />
        <Button
          preset="link"
          tx="common.sign_up"
          textStyle={{ fontSize: 14 }}
          onPress={() => navigation.navigate("signup")}
        />
      </View>
    </View>
  )

  return (
    <Layout
      noScroll
      footer={footer}
    >
      <View style={commonStyles.CENTER_VIEW}>
        <Image source={require("./logo.png")} />
        <Text
          preset="header"
          tx="onBoarding.title"
          style={{ fontSize: 14, marginTop: 31 }}
        />
      </View>
    </Layout>
  )
})
