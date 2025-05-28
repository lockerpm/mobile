import React, { FC } from "react"
import { View } from "react-native"
import { useAppLocale, useTheme } from "app/services/context"
import { Button, Screen, Text, Logo, Header } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { SetLanguage } from "app/components/utils"
import { UnAuthScreenProps } from "../../route"

export const OnboardingScreen: FC<UnAuthScreenProps<"onBoarding">> = observer((props) => {
  const { colors, isDark } = useTheme()
  const { translate } = useAppLocale()

  const navigateLogin = () => {
    props.navigation.replace("loginStack")
  }

  const navigateSignup = () => {
    props.navigation.replace("signupStack")
  }

  const footer = () => (
    <View
      style={{
        marginHorizontal: 20,
      }}
    >
      <Button preset="primary" text={translate("common.sign_in")} onPress={navigateLogin} />
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
      safeAreaEdges={["bottom"]}
      footer={footer()}
      header={<Header RightActionComponent={<SetLanguage />} />}
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
