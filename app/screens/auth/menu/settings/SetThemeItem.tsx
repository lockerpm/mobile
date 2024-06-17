import React, { useState } from "react"
import { SettingsItem } from "app/components/utils"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils/action-sheet/ActionSheet"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Text } from "app/components/cores"
import { useTheme } from "app/services/context"
import { useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { IS_IOS } from "app/config/constants"
import { AutofillDataType, loadShared, saveShared } from "app/utils/keychain"

export const SetThemeItem = observer(() => {
  const { colors, setIsDark, isDark } = useTheme()
  const { uiStore } = useStores()
  const { translate } = useHelper()

  const [isThemeSelect, setIsThemeSelect] = useState(false)

  const options = [
    {
      label: translate("settings.light_theme"),
      value: "Light",
    },
    {
      label: translate("settings.dark_theme"),
      value: "Dark",
    }
  ]

  const value = isDark ? "Dark" : "Light"

  const updateAutofillDarkTheme = async (enabled: boolean) => {
    if (!IS_IOS) {
      return
    }
    const credentials = await loadShared()
    if (credentials && credentials.password) {
      const sharedData: AutofillDataType = JSON.parse(credentials.password)
      sharedData.isDarkTheme = enabled
      await saveShared("autofill", JSON.stringify(sharedData))
    }
  }

  const setTheme = (theme: string) => {
    const isDark = theme === "Dark"
    uiStore.setIsDark(isDark)
    setIsDark(isDark)
    updateAutofillDarkTheme(isDark)
    setIsThemeSelect(false)
  }

  return (
    <View>
      <SettingsItem
        name={translate("settings.theme")}
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
