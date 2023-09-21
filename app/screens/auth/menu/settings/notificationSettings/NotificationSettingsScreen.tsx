import React from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { Screen, Header } from "app/components-v2/cores"
import { useTheme } from "app/services/context"
import { translate } from "app/i18n"
import { MenuItemContainer, SettingsItem } from "app/components-v2/utils"

export const NotificationSettingsScreen = observer(() => {
  const navigation = useNavigation()
  const { colors } = useTheme()

  return (
    <Screen
      padding
      preset="auto"
      header={(
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
          title={translate('common.notifications')}
        />
      )}
      backgroundColor={colors.block}
    >
      <MenuItemContainer>
        <SettingsItem
          name={translate('common.push_notifications')}
          onPress={() => navigation.navigate("deviceNotiSettings")}
        />
        <SettingsItem
          name={translate('common.email')}
          onPress={() => navigation.navigate("emailNotiSettings")}
        />
      </MenuItemContainer>
    </Screen>
  )
})