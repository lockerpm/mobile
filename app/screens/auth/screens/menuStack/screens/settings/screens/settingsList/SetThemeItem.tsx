import React, { useState } from "react"
import { SettingsItem } from "app/components/utils"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils/actionSheet/ActionSheet"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Text } from "app/components/cores"
import { useAppLocale, useTheme } from "app/services/context"
import { useStores } from "app/models"

export const SetThemeItem = observer(() => {
  const { colors, setIsDark, isDark } = useTheme()
  const { uiStore } = useStores()
  const { translate } = useAppLocale()

  const [isThemeSelect, setIsThemeSelect] = useState(false)

  const options = [
    {
      label: translate("settings.light_theme"),
      value: "Light",
    },
    {
      label: translate("settings.dark_theme"),
      value: "Dark",
    },
  ]

  const value = isDark ? translate("settings.dark_theme") : translate("settings.light_theme")

  const setTheme = (theme: string) => {
    const isDark = theme === "Dark"
    uiStore.setIsDark(isDark)
    setIsDark(isDark)
    setIsThemeSelect(false)
  }

  return (
    <View>
      <SettingsItem
        textTx={"settings.theme"}
        onPress={() => setIsThemeSelect(true)}
        RightAccessory={<Text text={value} />}
      />
      <NewActionSheet
        isOpen={isThemeSelect}
        onClose={() => setIsThemeSelect(false)}
        closeText={translate("common.cancel")}
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
            textStyle={{ flex: 1 }}
          />
        ))}
      </NewActionSheet>
    </View>
  )
})
