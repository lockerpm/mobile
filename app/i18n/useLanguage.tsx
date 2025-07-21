import { createContext, useContext, useMemo, useState } from "react"
import { LanguageSupportType, TxKeyPath } from "./i18n"
import i18n, { TOptions } from "i18next"
import { AppStorageKey, saveString } from "@/utils/storage"

const LocaleContext = createContext<{
  lang: LanguageSupportType
  setLanguage: (val: LanguageSupportType) => void
  translate: (tx: TxKeyPath, options?: TOptions) => string
}>({
  lang: "vi",
  setLanguage: (_: LanguageSupportType) => {
    //
  },
  translate: (_: TxKeyPath, _options?: TOptions) => "",
} as const)

function LocaleContextProvider({
  children,
  initLanguage = "vi",
}: {
  children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal
  initLanguage?: LanguageSupportType
}) {
  // const [isDark, setIsDark] = useState(false)
  const [lang, setLang] = useState<LanguageSupportType>(initLanguage)

  const setLanguage = (language: LanguageSupportType) => {
    saveString(AppStorageKey.LAST_USED_LOCALE, language)
    i18n.changeLanguage(language)
    setLang(language)
  }
  const translate = (key: TxKeyPath, options?: TOptions) => {
    if (i18n.isInitialized) {
      return i18n.t(key, options)
    }
    return key
  }

  const value = useMemo(
    () => ({
      lang,
      setLanguage,
      translate,
    }),
    [lang]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
const useAppLocale = () => useContext(LocaleContext)

export { useAppLocale, LocaleContextProvider }
