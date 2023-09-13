import React, { useEffect } from 'react'
import { Modal, Platform, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import { AppEventType, EventBus } from 'app/utils/eventBus'
import { useTheme } from 'app/services/context'
import { Header } from '../cores'
import { OverlayLoading } from '../utils'

type Props = {
  url: string
  isOpen: boolean
  onClose: () => void
  onURLChange?: (url: string) => void
}

const IS_IOS = Platform.OS === 'ios'

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
      supportedOrientations={['portrait', 'landscape']}
    >
      <View
        style={{
          paddingTop: IS_IOS ? insets.top : 0,
          paddingBottom: insets.bottom,
          flex: 1,
          backgroundColor: colors.background,
        }}
      >
        <View
          style={{
            borderBottomColor: colors.divider,
            borderBottomWidth: 0.5,
            padding: 16,
          }}
        >
          <Header leftIcon="caret-left" onLeftPress={onClose} />
        </View>
        <WebView
          incognito
          startInLoadingState
          renderLoading={() => <OverlayLoading />}
          source={{ uri: url }}
          onShouldStartLoadWithRequest={(request) => {
            onURLChange && onURLChange(request.url)

            // Prevent self deep linking
            if (request.url?.startsWith('com.cystack.locker')) {
              return false
            }

            return true
          }}
          originWhitelist={['https://*', 'com.cystack.locker://*']}
        />
      </View>
    </Modal>
  )
}
