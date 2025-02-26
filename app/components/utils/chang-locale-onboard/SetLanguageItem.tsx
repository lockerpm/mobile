import React, { useState } from "react"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils/action-sheet/ActionSheet"
import { observer } from "mobx-react-lite"
import { View, ViewProps } from "react-native"
import { Button, Icon } from "app/components/cores"
import { useTheme } from "app/services/context"
import { useHelper } from "app/services/hook"
import { useStores } from "app/models"

export const SetLanguage = observer((props: ViewProps) => {
  const { colors } = useTheme()
  const { user } = useStores()
  const { translate } = useHelper()
  const [isLanguageSelect, setIsLanguageSelect] = useState(false)

  const options: { label: string; value: "vi" | "en" | "zh" | "ru" }[] = [
    {
      label: "Tiếng Việt",
      value: "vi",
    },
    {
      label: "English",
      value: "en",
    },
    {
      label: "繁體中文",
      value: "zh",
    },
    {
      label: "Русский",
      value: "ru",
    },
  ]

  const setLanguage = (lang: string) => {
    user.setLanguage(lang)
    setIsLanguageSelect(false)
  }

  return (
    <View {...props}>
      <Button
        preset="teriatary"
        text={user.language.toUpperCase()}
        onPress={() => setIsLanguageSelect(true)}
        textStyle={{ color: colors.title }}
        RightAccessory={(props) => <Icon size={20} icon="caret-down" {...props} />}
      />
      <NewActionSheet
        isOpen={isLanguageSelect}
        onClose={() => setIsLanguageSelect(false)}
        closeText={translate("common.cancel")}
      >
        {options.map((item, index) => (
          <NewActionSheetItem
            icon={item.value === user.language ? "check" : undefined}
            iconColor={colors.success}
            key={index}
            text={item.label}
            onPress={() => {
              setLanguage(item.value)
            }}
            textStyle={{ flex: 1 }}
          />
        ))}
      </NewActionSheet>
    </View>
  )
})
