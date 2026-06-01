import { FC } from "react"
import { StyleSheet, View } from "react-native"

import { Button, Text, Logo, Screen, PressableText } from "app/components/cores"
import { SetLanguage } from "app/components/utils"
import { UnAuthScreenProps } from "app/navigators"

import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"

export const OnboardingScreen: FC<UnAuthScreenProps<"onBoarding">> = (props) => {
  const {
    theme: { colors },
    themeContext,
  } = useAppTheme()
  const { translate } = useAppLocale()

  const isDark = themeContext === "dark"

  const navigateLogin = async () => {
    props.navigation.replace("loginStack", {
      screen: "login",
    })
  }

  const navigateSignup = () => {
    props.navigation.replace("signupStack", {
      screen: "signup",
    })
  }

  return (
    <Screen safeAreaEdges={["bottom", "top"]} contentContainerStyle={[styles.flex, styles.pd20]}>
      <View style={styles.flex}>
        <View style={styles.setLanguage}>
          <SetLanguage />
        </View>
        <View style={styles.container}>
          <Logo preset={isDark ? "vertical-light" : "vertical-dark"} style={styles.logo} />
          <Text tx={"onBoarding:title"} preset="bold" />
        </View>
      </View>
      <View>
        <Button preset="primary" tx={"common:sign_in"} onPress={navigateLogin} />
        <View style={styles.rowWrap}>
          <Text style={styles.bottomText} text={translate("onBoarding:no_account") + " "} />
          <PressableText onPress={navigateSignup} color={colors.primary} tx={"common:sign_up"} />
        </View>
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
  logo: {
    height: 158,
    marginBottom: 16,
    width: 173,
  },
  pd20: {
    paddingHorizontal: 20,
  },
  rowWrap: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  setLanguage: {
    alignItems: "flex-end",
  },
})
