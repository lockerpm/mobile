import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { BackHandler, View } from "react-native"
import { AutoImage as Image, Button, Layout, Text } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../theme"
import { useMixins } from "../../../services/mixins"
import { APP_ICON } from "../../../common/mappings"
import { IS_IOS } from "../../../config/constants"

export const OnboardingScreen = observer(function OnboardingScreen() {
  const navigation = useNavigation()
  const { translate } = useMixins()

  // Child components
  const footer = (
    <View>
      <Button text={translate("common.login")} onPress={() => navigation.navigate("login")} />
      <View
        style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
          marginTop: 12,
          justifyContent: 'center'
        }]}
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

  // -------------- EFFECT ------------------

  useEffect(() => {
    const handleBack = (e) => {
      e.preventDefault()
      if (!IS_IOS) {
        BackHandler.exitApp()
      }
    }

    navigation.addListener('beforeRemove', handleBack)

    return () => {
      navigation.removeListener('beforeRemove', handleBack)
    }
  }, [navigation])

  return (
    <Layout
      noScroll
      footer={footer}
    >
      <View style={commonStyles.CENTER_VIEW}>
        <Image source={APP_ICON.textVertical} style={{ height: 112, width: 128 }} />
        <Text
          preset="header"
          text={translate("onBoarding.title")}
          style={{ fontSize: fontSize.p, marginTop: 31 }}
        />
      </View>
    </Layout>
  )
})
