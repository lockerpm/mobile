import React from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigation } from '@react-navigation/native'
import { Screen, Header } from 'app/components/cores'
import { useTheme } from 'app/services/context'
import { MenuItemContainer, SettingsItem } from 'app/components/utils'
import { useHelper } from 'app/services/hook'

export const NotificationSettingsScreen = observer(() => {
  const navigation = useNavigation() as any
  const { colors } = useTheme()
  const { translate } = useHelper()

  return (
    <Screen
      padding
      preset="auto"
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
          title={translate('common.notifications')}
        />
      }
      backgroundColor={colors.block}
    >
      <MenuItemContainer>
        <SettingsItem
          name={translate('common.push_notifications')}
          onPress={() => navigation.navigate('deviceNotiSettings')}
        />
        <SettingsItem
          name={translate('common.email')}
          onPress={() => navigation.navigate('emailNotiSettings')}
        />
      </MenuItemContainer>
    </Screen>
  )
})
