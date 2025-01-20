import React, { useState } from "react"
import { SettingsItem } from "app/components/utils"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils/action-sheet/ActionSheet"
import { observer } from "mobx-react-lite"
import { Linking, TouchableOpacity, View } from "react-native"
import { Text } from "app/components/cores"
import { useTheme } from "app/services/context"
import { useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { IS_IOS } from "app/config/constants"
import { AutofillDataType, loadShared, saveShared } from "app/utils/keychain"

export const SetlanguageItem = observer(() => {
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

  const updateAutofillLanguage = async (language: string) => {
    if (!IS_IOS) {
      return
    }
    const credentials = await loadShared()
    if (credentials && credentials.password) {
      const sharedData: AutofillDataType = JSON.parse(credentials.password)
      sharedData.language = language
      await saveShared("autofill", JSON.stringify(sharedData))
    }
  }

  const setLanguage = (lang: string) => {
    user.setLanguage(lang)

    // user.changeLanguage()
    updateAutofillLanguage(lang)
    setIsLanguageSelect(false)
  }

  return (
    <View>
      <SettingsItem
        name={translate("common.language")}
        onPress={() => setIsLanguageSelect(true)}
        RightAccessory={<Text text={options.find((e) => e.value === user.language).label} />}
      />
      <NewActionSheet
        isOpen={isLanguageSelect}
        onClose={() => setIsLanguageSelect(false)}
        closeText={translate("common.cancel")}
        footer={
          <TouchableOpacity
            style={{
              padding: 12,
            }}
            onPress={() => {
              Linking.openURL(
                `https://cystack.notion.site/Locker-Translation-Guide-bb4e4fc4c23d4bbc994375035b124829`,
              )
            }}
          >
            <Text
              text="Don't find your language?"
              style={{
                textAlign: "center",
              }}
              color={colors.link}
            />
          </TouchableOpacity>
        }
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
