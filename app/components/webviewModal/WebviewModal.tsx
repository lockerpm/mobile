import React, { useEffect } from "react"
import { Modal, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { WebView } from "react-native-webview"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { useTheme } from "app/services/context"
import {  Icon } from "../cores"
import { OverlayLoading } from "../utils"

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

  // Close on signal
  useEffect(() => {
    const listener = EventBus.createListener(AppEventType.CLOSE_ALL_MODALS, () => {
      onClose()
    })
    return () => {
      EventBus.removeListener(listener)
    }
  }, [])

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
        <View
          style={{
            position: "absolute",
            top: 8,
            left: 20,
            zIndex: 2,
          }}
        >
          <Icon icon="caret-left" onPress={onClose} />
        </View>

        {/* <Header leftIcon="caret-left" onLeftPress={onClose} /> */}
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
