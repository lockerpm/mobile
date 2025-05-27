/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useContext, useMemo, useState } from "react"
import {
  LanguageSupportType,
  setLang as I18nSetLang,
  TxKeyPath,
  translate as tl,
  TOptions,
} from "app/i18n"

const LocaleContext = createContext<{
  lang: LanguageSupportType
  setLanguage: (val: LanguageSupportType) => void
  translate: (tx: TxKeyPath, options?: TOptions) => string
}>({
  lang: "vi",
  setLanguage: (_: LanguageSupportType) => {
    //
  },
  translate: (_: TxKeyPath, options?: TOptions) => "",
})

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
    setLang(language)
    I18nSetLang(language)
  }
  const translate = (tx: TxKeyPath, options?: TOptions) => {
    return tl(tx, options)
  }

  const value = useMemo(
    () => ({
      lang,
      setLanguage,
      translate,
    }),
    [lang],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
const useAppLocale = () => useContext(LocaleContext)

export { useAppLocale, LocaleContextProvider }
