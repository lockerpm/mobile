import React from 'react'
import { Linking } from 'react-native'
import { Screen, Header } from 'app/components/cores'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from 'app/services/context'
import { HELP_CENTER_URL, PRIVACY_POLICY_URL, REPORT_VULN, TERMS_URL } from 'app/config/constants'
import { Logger } from 'app/utils/utils'
import { MenuItemContainer, SettingsItem } from 'app/components/utils'
import { observer } from 'mobx-react-lite'
import { useHelper } from 'app/services/hook'

type Item = {
  name: string
  disabled?: boolean
  action?: () => void
}

export const HelpScreen = observer(() => {
  const navigation = useNavigation() as any
  const { colors } = useTheme()
  const { translate } = useHelper()

  const items: Item[] = [
    {
      name: translate('help.help_center'),
      action: () => {
        Linking.canOpenURL(HELP_CENTER_URL)
          .then((val) => {
            if (val) Linking.openURL(HELP_CENTER_URL)
          })
          .catch((e) => Logger.error(e))
      },
    },
    {
      name: translate('help.terms'),
      action: () => {
        Linking.canOpenURL(TERMS_URL)
          .then((val) => {
            if (val) Linking.openURL(TERMS_URL)
          })
          .catch((e) => Logger.error(e))
      },
    },
    {
      name: translate('help.policy'),
      action: () => {
        Linking.canOpenURL(PRIVACY_POLICY_URL)
          .then((val) => {
            if (val) Linking.openURL(PRIVACY_POLICY_URL)
          })
          .catch((e) => Logger.error(e))
      },
    },
    {
      name: translate('help.report_vuln'),
      action: () => {
        Linking.canOpenURL(REPORT_VULN)
          .then((val) => {
            if (val) Linking.openURL(REPORT_VULN)
          })
          .catch((e) => Logger.error(e))
      },
    },
  ]

  return (
    <Screen
      padding
      preset="auto"
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
          title={translate('common.help')}
        />
      }
      backgroundColor={colors.block}
    >
      <MenuItemContainer>
        {items.map((item, index) => (
          <SettingsItem
            key={index}
            name={item.name}
            disabled={item.disabled}
            onPress={item.action}
          />
        ))}
      </MenuItemContainer>
    </Screen>
  )
})
