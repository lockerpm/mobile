import React, { FC } from "react"
import { Screen, Header } from "app/components/cores"
import { useTheme } from "app/services/context"
import { MenuItemContainer, SettingsItem } from "app/components/utils"
import { TxKeyPath } from "app/i18n"
import { MenuScreenProps } from "app/navigators"
import {
  openHelpCenter,
  openPrivacyPolicy,
  openReportVuln,
  openTerms,
} from "app/utils/externalLink"

type Item = {
  name: TxKeyPath
  disabled?: boolean
  action?: () => void
}

export const HelpScreen: FC<MenuScreenProps<"help">> = ({ navigation }) => {
  const { colors } = useTheme()

  const items: Item[] = [
    {
      name: "help.help_center",
      action: openHelpCenter,
    },
    {
      name: "help.terms",
      action: openTerms,
    },
    {
      name: "help.policy",
      action: openPrivacyPolicy,
    },
    {
      name: "help.report_vuln",
      action: openReportVuln,
    },
  ]

  return (
    <Screen
      padding
      preset="auto"
      header={
        <Header leftIcon="arrow-left" onLeftPress={navigation.goBack} titleTx={"common.help"} />
      }
      backgroundColor={colors.block}
    >
      <MenuItemContainer>
        {items.map((item, index) => (
          <SettingsItem
            key={index}
            textTx={item.name}
            disabled={item.disabled}
            onPress={item.action}
          />
        ))}
      </MenuItemContainer>
    </Screen>
  )
}
