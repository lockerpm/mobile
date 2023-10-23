import i18n from 'i18n-js'
import en from './en.json'
import vi from './vi.json'
import { I18nManager } from 'react-native'

i18n.fallbacks = true
i18n.translations = { en, vi }

i18n.locale = 'en'

// handle RTL languages
I18nManager.allowRTL(false)
I18nManager.forceRTL(false)

/**
 * Builds up valid keypaths for translations.
 * Update to your default locale of choice if not English.
 */
type DefaultLocale = typeof en
export type TxKeyPath = RecursiveKeyOf<DefaultLocale>

type RecursiveKeyOf<TObj extends Record<string, any>> = {
  [TKey in keyof TObj & string]: TObj[TKey] extends Record<string, any>
    ? `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
    : `${TKey}`
}[keyof TObj & string]
