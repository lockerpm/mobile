import React from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { AutoImage as Image, Button, Layout, Text } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../theme"
import { useMixins } from "../../../services/mixins"

export const OnboardingScreen = observer(function OnboardingScreen() {
  const navigation = useNavigation()
  const { translate } = useMixins()

  // Child components
  const footer = (
    <View>
      <Button text={translate("common.login")} onPress={() => navigation.navigate("login")} />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 12,
          marginBottom: 24
        }}
      >
        <Text
          text={translate("onBoarding.no_account")}
          style={{
            marginRight: 8,
          }}
        />
        <Button
          preset="link"
          text={translate("common.sign_up")}
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
          text={translate("onBoarding.title")}
          style={{ fontSize: fontSize.p, marginTop: 31 }}
        />
      </View>
    </Layout>
  )
})
