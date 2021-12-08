import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { BackHandler, View } from "react-native"
import { AutoImage as Image, Button, Layout, Text } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../theme"
import { useMixins } from "../../../services/mixins"
import { APP_ICON } from "../../../common/mappings"
import { IS_IOS } from "../../../config/constants"
import { useStores } from "../../../models"

export const OnboardingScreen = observer(function OnboardingScreen() {
  const navigation = useNavigation()
  const { translate } = useMixins()
  const { uiStore } = useStores()

  // Child components
  const footer = (
    <View>
      <Button text={translate("common.login")} 
      onPress={() => navigation.navigate("login")} />
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
      if (!['POP', 'GO_BACK'].includes(e.data.action.type)) {
        navigation.dispatch(e.data.action)
        return
      }
      
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
        <Image 
          source={uiStore.isDark ? APP_ICON.textVerticalLight : APP_ICON.textVertical} 
          style={{ height: 112, width: 128 }} 
        />
        <Text
          preset="header"
          text={translate("onBoarding.title")}
          style={{ fontSize: fontSize.p, marginTop: 31 }}
        />
      </View>
    </Layout>
  )
})
