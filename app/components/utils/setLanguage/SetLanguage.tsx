import { useCallback, useMemo, useState } from "react"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils"
import { StyleSheet, TouchableOpacity, View, ViewProps, ViewStyle } from "react-native"
import { Icon, Text } from "app/components/cores"
import { LanguageSupportType, useAppLocale } from "app/i18n"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

export const SetLanguage = ({ style, ...props }: ViewProps) => {
  const { setLanguage, lang } = useAppLocale()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

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
      {
        label: "Français",
        value: "fr",
      },
    ],
    []
  )

  const handleSetLanguage = useCallback((lang: LanguageSupportType) => {
    setLanguage(lang)
    setIsLanguageSelect(false)
  }, [])

  return (
    <View style={themed([$container, style])} {...props}>
      <TouchableOpacity onPress={() => setIsLanguageSelect(true)}>
        <View style={styles.content}>
          <Text preset="bold" text={lang.toUpperCase() + " "} />
          <Icon icon="caret-down" />
        </View>
      </TouchableOpacity>
      <NewActionSheet isOpen={isLanguageSelect} onClose={() => setIsLanguageSelect(false)}>
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

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 8,
  borderWidth: 1,
  padding: 8,
  paddingVertical: 6,
  borderColor: colors.border,
  backgroundColor: colors.block,
})

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    flexDirection: "row",
  },
})
