// Note the syntax of these imports from the date-fns library.
// If you import with the syntax: import { format } from "date-fns" the ENTIRE library
// will be included in your production bundle (even if you only use one function).
// This is because react-native does not support tree-shaking.
import { type Locale } from "date-fns/locale"
import { format } from "date-fns/format"
import { parseISO } from "date-fns/parseISO"
import i18n from "i18next"
import { vi, zhCN, enUS, ru } from "date-fns/locale"
import { formatDistanceToNow } from "date-fns"

type Options = Parameters<typeof format>[2]

let dateFnsLocale: Locale
export const loadDateFnsLocale = () => {
  const primaryTag = i18n.language.split("-")[0]
  switch (primaryTag) {
    case "en":
      dateFnsLocale = enUS
      break
    case "zh":
      dateFnsLocale = zhCN
      break
    case "vi":
      dateFnsLocale = vi
      break
    case "ru":
      dateFnsLocale = ru
      break
    default:
      dateFnsLocale = require("date-fns/locale/en-US").default
      break
  }
}

export const formatDate = (date: string | number, dateFormat?: string, options?: Options) => {
  const dateOptions = {
    ...options,
    locale: dateFnsLocale,
  }
  // Kiểm tra nếu date là dạng timestamp (number)
  const parsedDate = typeof date === "number" ? new Date(date) : parseISO(date)

  return format(parsedDate, dateFormat ?? "MMM dd, yyyy", dateOptions)
}

export const getRelativeTime = (date: string | number) => {
  // Kiểm tra nếu date là dạng timestamp (number)
  const parsedDate = typeof date === "number" ? new Date(date) : parseISO(date)
  return formatDistanceToNow(parsedDate, { locale: dateFnsLocale })
}
