import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View, Switch } from "react-native"
import { Layout, Header } from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles } from "../../../../../theme"
import { useStores } from "../../../../../models"
import { SettingsItem } from "../settings-item"
import { useMixins } from "../../../../../services/mixins"
import { EmptyResult } from "../../../../../services/api"


export const NotificationSettingsScreen = observer(function NotificationSettingsScreen() {
  const navigation = useNavigation()
  const { user } = useStores()
  const { translate, color, boostrapPushNotifier, notifyApiError } = useMixins()

  // ----------------------- PARAMS -----------------------

  const [isLoading, setIsLoading] = useState(false)

  // ----------------------- METHODS -----------------------

  const togglePushNotifications = async (val: boolean) => {
    setIsLoading(true)
    let res: EmptyResult
    if (val) {
      await boostrapPushNotifier()
      res = await user.updateFCM(user.fcmToken)
    } else {
      res = await user.updateFCM(null)
    }
    setIsLoading(false)
    if (res.kind === 'ok') {
      user.setPushNotificationsSetting(!val)
    } else {
      notifyApiError(res)
    }
  }

  // ----------------------- EFFECT -------------------------

  // ----------------------- RENDER -----------------------

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('common.notifications')}
          right={(<View style={{ width: 10 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <View style={[commonStyles.GRAY_SCREEN_SECTION, {
        backgroundColor: color.background
      }]}>
        {/* Push notifications */}
        <SettingsItem
          name={translate('common.push_notifications')}
          noCaret
          noBorder
          right={(
            <Switch
              value={!user.disablePushNotifications}
              onValueChange={togglePushNotifications}
              trackColor={{ false: color.disabled, true: color.primary }}
              thumbColor={color.white}
            />
          )}
        />
        {/* Push notifications end */}
      </View>
    </Layout>
  )
})
