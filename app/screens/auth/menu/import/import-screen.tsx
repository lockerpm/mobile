import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Header } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { color, commonStyles } from "../../../../theme"
import { useMixins } from "../../../../services/mixins"
import { SettingsItem } from "../settings/settings-item"


export const ImportScreen = observer(function ImportScreen() {
  const navigation = useNavigation()
  const { translate } = useMixins()

  // PARAMS

  const [isLoading, setIsLoading] = useState(false)

  // METHODS

  // EFFECT

  // RENDER

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('settings.import')}
          right={(<View style={{ width: 10 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <View style={commonStyles.GRAY_SCREEN_SECTION}>
        <SettingsItem
          name={translate('settings.import')}
          action={() => navigation.navigate('autofillService')}
        />
      </View> 
    </Layout>
  )
})
