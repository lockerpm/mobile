import React from "react"
import { View } from "react-native"
import { Layout, Header } from "../../../../../components"
import { SettingsItem, SectionWrapperItem } from "../settings-item"
import { useMixins } from "../../../../../services/mixins"
import { useNavigation } from "@react-navigation/native"

export const EmergencyAccessScreen = () => {
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
          title={translate('emergency_access.title')}
          right={(<View style={{ width: 30 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <SectionWrapperItem>
        {/* Push notifications */}
        <SettingsItem
          name={translate('emergency_access.your_trust')}
          action={() => navigation.navigate("yourTrustedContact")}
        />
        {/* Push notifications end */}

        {/* Email */}
        <SettingsItem
          noBorder
          name={translate('emergency_access.trust_you')}
          action={() => navigation.navigate("contactsTrustedYou")}
        />
        {/* Email end */}
      </SectionWrapperItem>
    </Layout>
  )
}

