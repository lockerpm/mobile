/* eslint-disable react-native/no-inline-styles */
import { useState } from "react"
import { TouchableOpacity, View } from "react-native"
import { observer } from "mobx-react-lite"

import { Text } from "app/components/cores"
import { SettingsItem } from "app/components/utils"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils"
import { LanguageSupportType, useAppLocale } from "app/i18n"
import { useStores } from "app/models"
import { useCoreService } from "app/services/coreService"

import { autofillKeyChain } from "@/utils/autofill.ios"
import { openLanguageSupport } from "@/utils/openLinkInBrowser"
import { useAppTheme } from "@/utils/useAppTheme"

export const SetlanguageItem = observer(() => {
  const { cryptoService } = useCoreService()
  const {
    theme: { colors },
  } = useAppTheme()
  const { user } = useStores()
  const { lang, setLanguage: setLocalLanguage } = useAppLocale()
  const [isLanguageSelect, setIsLanguageSelect] = useState(false)

  const options: { label: string; value: LanguageSupportType }[] = [
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
  ]

  const updateAutofillLanguage = async (language: string) => {
    const hashPasswordAutofill = await cryptoService.getAutofillKeyHash()
    await autofillKeyChain.saveUserInfo({
      email: user.email || "",
      avatar: user.avatar || "",
      hashPass: hashPasswordAutofill || "",
      token: user.apiToken || "",
      language,

      faceIdEnabled: user.isBiometricUnlock,
      isFree: user.isFreePlan,
    })
  }

  const setLanguage = (lang: LanguageSupportType) => {
    setLocalLanguage(lang)
    updateAutofillLanguage(lang)
    setIsLanguageSelect(false)
    user.changeLanguage(lang)
  }

  return (
    <View>
      <SettingsItem
        textTx={"common:language"}
        onPress={() => setIsLanguageSelect(true)}
        RightAccessory={<Text text={options.find((e) => e.value === lang)?.label} />}
      />
      <NewActionSheet
        isOpen={isLanguageSelect}
        onClose={() => setIsLanguageSelect(false)}
        closeTx={"common:cancel"}
        footer={
          <TouchableOpacity
            style={{
              padding: 12,
            }}
            onPress={openLanguageSupport}
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
            icon={item.value === lang ? "check" : undefined}
            iconColor={colors.success}
            key={index}
            text={item.label}
            onPress={() => {
              setLanguage(item.value)
            }}
          />
        ))}
      </NewActionSheet>
    </View>
  )
})
