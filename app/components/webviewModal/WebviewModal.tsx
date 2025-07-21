import { Modal, View, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { WebView } from "react-native-webview"
import { PressableIcon } from "../cores"
import { useAppTheme } from "@/utils/useAppTheme"
import { OverlayLoading } from "../utils"

type Props = {
  url: string
  isOpen: boolean
  onClose: () => void
  onURLChange?: (url: string) => void
}

export const WebViewModal = (props: Props) => {
  const { url, isOpen, onClose, onURLChange } = props
  const { theme } = useAppTheme()
  const insets = useSafeAreaInsets()

  const $container: ViewStyle = {
    marginTop: insets.top,
    paddingBottom: insets.bottom,
    flex: 1,
    backgroundColor: theme.colors.background,
  }
  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      onRequestClose={onClose}
      supportedOrientations={["portrait", "landscape"]}
    >
      <View style={$container}>
        <View style={$header}>
          <PressableIcon icon="caret-left" onPress={onClose} />
        </View>

        <WebView
          incognito
          startInLoadingState
          renderLoading={() => <OverlayLoading />}
          source={{ uri: url }}
          onShouldStartLoadWithRequest={(request) => {
            if (onURLChange) {
              onURLChange(request.url)
            }
            // Prevent self deep linking
            if (request.url?.startsWith("com.cystack.locker")) {
              return false
            }

            return true
          }}
          originWhitelist={["https://*", "com.cystack.locker://*"]}
        />
      </View>
    </Modal>
  )
}

const $header: ViewStyle = {
  position: "absolute",
  top: 8,
  left: 20,
  zIndex: 2,
}
