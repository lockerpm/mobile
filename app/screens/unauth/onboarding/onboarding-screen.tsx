import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { BackHandler, View } from "react-native"
import { AutoImage as Image, Button, Layout, Text } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles, fontSize, spacing } from "../../../theme"
import { useMixins } from "../../../services/mixins"
import { APP_ICON } from "../../../common/mappings"
import { IS_IOS } from "../../../config/constants"
import { useStores } from "../../../models"
import { useAdaptiveLayoutMixins } from "../../../services/mixins/adaptive-layout"
import { LanguagePicker } from "../../../components/utils"

export const OnboardingScreen = observer(() => {
  const navigation = useNavigation()
  const { translate } = useMixins()
  const { uiStore } = useStores()
  const { verticalScale } = useAdaptiveLayoutMixins()


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
      footer={<View>
        <Button
          text={translate("common.sign_up")}
          onPress={() => navigation.navigate("signup")}
        />
        <View
          style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
            marginTop: spacing.medium,
            justifyContent: 'center'
          }]}
        >
          <Text
            text={translate("onBoarding.has_account")}
            style={{
              marginRight: spacing.small,
            }}
          />
          <Button
            preset="link"
            text={translate("common.login")}
            onPress={() => navigation.navigate("loginSelect")}
          />
        </View>
      </View>}
    >
      <LanguagePicker />
      <View style={commonStyles.CENTER_VIEW}>
        <Image
          source={uiStore.isDark ? APP_ICON.textVerticalLight : APP_ICON.textVertical}
          style={{ height: verticalScale(112), width: verticalScale(128) }}
        />
        <Text
          preset="header"
          text={translate("onBoarding.title")}
          style={{ fontSize: fontSize.p, marginTop: spacing.huge }}
        />
      </View>
    </Layout>
  )
})
