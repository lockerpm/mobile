import React, { useMemo, useState } from "react"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils"
import { StyleSheet, TouchableOpacity, View, ViewProps } from "react-native"
import { Icon, Text } from "app/components/cores"
import { useAppLocale, useTheme } from "app/services/context"
import { useStores } from "app/models"
import { LanguageSupportType } from "app/i18n"

export const SetLanguage = ({ style, ...props }: ViewProps) => {
  const { colors } = useTheme()
  const { user } = useStores()
  const { translate, setLanguage, lang } = useAppLocale()

  const [isLanguageSelect, setIsLanguageSelect] = useState(false)

  const options: { label: string; value: LanguageSupportType }[] = useMemo(
    () => [
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
    ],
    [],
  )

  const handleSetLanguage = (lang: LanguageSupportType) => {
    user.setLanguage(lang)
    setLanguage(lang)
    setIsLanguageSelect(false)
  }

  return (
    <View
      style={[
        styles.container,
        { borderColor: colors.border, backgroundColor: colors.block },
        style,
      ]}
      {...props}
    >
      <TouchableOpacity onPress={() => setIsLanguageSelect(true)}>
        <View style={styles.content}>
          <Text preset="bold" text={lang.toUpperCase() + " "} />
          <Icon icon="caret-down" />
        </View>
      </TouchableOpacity>
      <NewActionSheet
        isOpen={isLanguageSelect}
        onClose={() => setIsLanguageSelect(false)}
        closeText={translate("common.cancel")}
      >
        {options.map((item, index) => (
          <NewActionSheetItem
            icon={item.value === lang ? "check" : undefined}
            iconColor={colors.success}
            key={index}
            text={item.label}
            onPress={() => {
              handleSetLanguage(item.value)
            }}
          />
        ))}
      </NewActionSheet>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    paddingVertical: 6,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
  },
})
