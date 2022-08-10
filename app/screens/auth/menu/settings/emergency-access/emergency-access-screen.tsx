import React from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Header } from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SettingsItem, SectionWrapperItem } from "../settings-item"
import { useMixins } from "../../../../../services/mixins"


export const EmergencyAccessScreen = observer(function EmergencyAccessScreen() {
  const navigation = useNavigation()
  const { translate, color } = useMixins()

  // ----------------------- PARAMS -----------------------

  // ----------------------- METHODS -----------------------

  // ----------------------- RENDER -----------------------

  return (
    <Layout
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={"Emergency access"}
          right={(<View style={{ width: 30 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <SectionWrapperItem title={translate('noti_setting.in_app_noti')}>
        {/* Push notifications */}
        <SettingsItem
          name={translate('common.push_notifications')}
          action={() => navigation.navigate("deviceNotiSettings")}
        />
        {/* Push notifications end */}

        {/* Email */}
        <SettingsItem
          name={translate('common.email')}
          action={() => navigation.navigate("emailNotiSettings")}
        />
        {/* Email end */}
      </SectionWrapperItem>
    </Layout>
  )
})
