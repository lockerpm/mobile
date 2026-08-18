import { FC } from "react"
import { ViewStyle } from "react-native"

import { Screen, Header } from "app/components/cores"
import { MenuItemContainer, SettingsItem } from "app/components/utils"
import { TxKeyPath } from "app/i18n"
import { MenuScreenProps } from "app/navigators"
import {
  openHelpCenter,
  openPrivacyPolicy,
  openReportVuln,
  openTerms,
} from "app/utils/openLinkInBrowser"

import { useAppTheme } from "@/utils/useAppTheme"

type Item = {
  name: TxKeyPath
  disabled?: boolean
  action?: () => void
}

export const HelpScreen: FC<MenuScreenProps<"help">> = ({ navigation }) => {
  const {
    theme: { colors },
  } = useAppTheme()

  const items: Item[] = [
    {
      name: "help:help_center",
      action: openHelpCenter,
    },
    {
      name: "help:terms",
      action: openTerms,
    },
    {
      name: "help:policy",
      action: openPrivacyPolicy,
    },
    {
      name: "help:report_vuln",
      action: openReportVuln,
    },
  ]

  return (
    <Screen
      preset="auto"
      header={
        <Header leftIcon="arrow-left" onLeftPress={navigation.goBack} titleTx={"common:help"} />
      }
      backgroundColor={colors.block}
      contentContainerStyle={$container}
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

const $container: ViewStyle = {
  flex: 1,
  paddingHorizontal: 16,
}
