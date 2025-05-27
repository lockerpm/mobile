import { useAppLocale } from "../context"
import { useHelper } from "../hook"
import Clipboard from "@react-native-clipboard/clipboard"

export const useClipboard = () => {
  const { translate } = useAppLocale()
  const { notify } = useHelper()
  // Clipboard
  const copyToClipboard = (text: string) => {
    notify("success", translate("common.copied_to_clipboard"), 1000)
    Clipboard.setString(text)
  }
  return {
    copyToClipboard,
  }
}
