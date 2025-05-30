import Clipboard from "@react-native-clipboard/clipboard"
import { useToast } from "./useToast"

export const useClipboard = () => {
  const { notifyTx } = useToast()
  // Clipboard
  const copyToClipboard = (text: string) => {
    notifyTx("success", "common.copied_to_clipboard")
    Clipboard.setString(text)
  }
  return {
    copyToClipboard,
  }
}
