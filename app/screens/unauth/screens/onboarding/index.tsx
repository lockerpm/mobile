import React, { FC } from "react"
import { StyleSheet, View } from "react-native"
import { useAppLocale, useTheme } from "app/services/context"
import { Button, Screen, Text, Logo } from "app/components/cores"
import { SetLanguage } from "app/components/utils"
import { UnAuthScreenProps } from "app/navigators"

export const OnboardingScreen: FC<UnAuthScreenProps<"onBoarding">> = (props) => {
  const { colors, isDark } = useTheme()
  const { translate } = useAppLocale()

  const navigateLogin = () => {
    props.navigation.replace("loginStack", {
      screen: "login",
    })
  }

  const navigateSignup = () => {
    props.navigation.replace("signupStack", {
      screen: "signup",
    })
  }

  const footer = () => (
    <View style={styles.footer}>
      <Button preset="primary" tx={"common.sign_in"} onPress={navigateLogin} />
      <Text style={styles.bottomText}>
        {translate("onBoarding.no_account") + " "}
        <Text onPress={navigateSignup} color={colors.primary} tx={"common.sign_up"} />
      </Text>
    </View>
  )

  return (
    <Screen
      safeAreaEdges={["top", "bottom"]}
      footer={footer()}
      KeyboardAvoidingViewProps={{
        behavior: undefined,
      }}
      padding
      contentContainerStyle={styles.flex}
    >
      <View style={styles.setLanguage}>
        <SetLanguage />
      </View>
      <View style={styles.container}>
        <Logo preset={isDark ? "vertical-light" : "vertical-dark"} style={styles.logo} />
        <Text tx={"onBoarding.title"} preset="bold" />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  bottomText: {
    marginVertical: 12,
    textAlign: "center",
  },
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  flex: {
    flex: 1,
  },
  footer: {
    marginHorizontal: 20,
  },
  logo: {
    height: 158,
    marginBottom: 16,
    width: 173,
  },
  setLanguage: {
    alignItems: "flex-end",
  },
})
