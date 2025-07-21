import { useState } from "react"
import { SettingsItem } from "app/components/utils"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Text } from "app/components/cores"
import { useAppTheme } from "@/utils/useAppTheme"
import { useAppLocale } from "@/i18n"
import { ThemeContexts } from "@/theme"

export const SetThemeItem = observer(() => {
  const {
    theme: { colors },
    setThemeContext,
    themeContext,
  } = useAppTheme()
  const { translate } = useAppLocale()
  const isDark = themeContext === "dark"

  const [isThemeSelect, setIsThemeSelect] = useState(false)

  const options = [
    {
      label: translate("settings:light_theme"),
      value: "Light",
    },
    {
      label: translate("settings:dark_theme"),
      value: "Dark",
    },
  ]

  const value = isDark ? translate("settings:dark_theme") : translate("settings:light_theme")

  const setTheme = (theme: string) => {
    setThemeContext(theme.toLowerCase() as ThemeContexts)
    setIsThemeSelect(false)
  }

  return (
    <View>
      <SettingsItem
        textTx={"settings:theme"}
        onPress={() => setIsThemeSelect(true)}
        RightAccessory={<Text text={value} />}
      />
      <NewActionSheet
        isOpen={isThemeSelect}
        onClose={() => setIsThemeSelect(false)}
        closeTx="common:cancel"
      >
        {options.map((item, index) => (
          <NewActionSheetItem
            icon={item.value === value ? "check" : undefined}
            iconColor={colors.success}
            key={index}
            text={item.label}
            onPress={() => {
              setTheme(item.value)
            }}
          />
        ))}
      </NewActionSheet>
    </View>
  )
})
