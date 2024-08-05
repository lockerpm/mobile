import React, { FC } from "react"
import { View } from "react-native"
import { useTheme } from "app/services/context"
import { Button, Screen, Text, Logo } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { useHelper } from "app/services/hook"
import { RootStackScreenProps } from "app/navigators/navigators.types"

export const OnboardingScreen: FC<RootStackScreenProps<"onBoarding">> = observer((props) => {
  const { colors, isDark } = useTheme()
  const { translate } = useHelper()

  const navigateLogin = () => {
    props.navigation.replace("login")
  }

  const navigateSignup = () => {
    props.navigation.replace("signup")
  }

  const footer = () => (
    <View
      style={{
        marginHorizontal: 20,
      }}
    >
      <Button preset="primary" text={translate("common.login")} onPress={navigateLogin} />
      <Text
        style={{
          textAlign: "center",
          marginVertical: 12,
        }}
      >
        {translate("onBoarding.no_account") + " "}
        <Text
          onPress={navigateSignup}
          style={{ color: colors.primary }}
          text={translate("common.sign_up")}
        />
      </Text>
    </View>
  )

  return (
    <Screen
      safeAreaEdges={["bottom", "top"]}
      footer={footer()}
      KeyboardAvoidingViewProps={{
        behavior: undefined,
      }}
      contentContainerStyle={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Logo
        preset={isDark ? "vertical-light" : "vertical-dark"}
        style={{
          width: 173,
          height: 158,
          marginBottom: 16,
        }}
      />
      <Text text={translate("onBoarding.title")} preset="bold" />
    </Screen>
  )
})
