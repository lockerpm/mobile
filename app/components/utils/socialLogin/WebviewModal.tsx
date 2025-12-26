import { Modal, Platform, View, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { WebView } from "react-native-webview"

import { useAppTheme } from "@/utils/useAppTheme"

import { PressableIcon } from "../../cores"
import { OverlayLoading } from "../../utils"

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
    marginTop: Platform.OS === "android" ? insets.top : 0,
    paddingBottom: insets.bottom,
    flex: 1,
    backgroundColor: theme.colors.background,
  }
  return (
    <Modal
      visible={isOpen}
      presentationStyle="formSheet"
      animationType="slide"
      onRequestClose={onClose}
      supportedOrientations={["portrait", "landscape"]}
    >
      <View style={$container}>
        <View style={$header}>
          <PressableIcon icon="x" onPress={onClose} color={theme.colors.black} />
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
  top: 20,
  right: 20,
  zIndex: 2,
}
