import React from "react"
import { Modal, View, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { WebView } from "react-native-webview"
import { useTheme } from "app/services/context"
import { Icon } from "../cores"
import { OverlayLoading } from "../utils/loading/Loading"

type Props = {
  url: string
  isOpen: boolean
  onClose: () => void
  onURLChange?: (url: string) => void
}

export const WebViewModal = (props: Props) => {
  const { url, isOpen, onClose, onURLChange } = props
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      onRequestClose={onClose}
      supportedOrientations={["portrait", "landscape"]}
    >
      <View
        style={{
          marginTop: insets.top,
          paddingBottom: insets.bottom,
          flex: 1,
          backgroundColor: colors.background,
        }}
      >
        <View style={$header}>
          <Icon icon="caret-left" onPress={onClose} />
        </View>

        <WebView
          incognito
          startInLoadingState
          renderLoading={() => <OverlayLoading />}
          source={{ uri: url }}
          onShouldStartLoadWithRequest={(request) => {
            onURLChange && onURLChange(request.url)
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
