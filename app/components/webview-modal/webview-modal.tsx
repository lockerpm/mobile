import React from 'react'
import { Modal, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import { IS_IOS } from '../../config/constants'
import { useMixins } from '../../services/mixins'
import { commonStyles } from '../../theme'
import { Header } from '../header/header'
import { OverlayLoading } from '../loading/loading'


type Props = {
  url: string
  isOpen: boolean
  onClose: () => void
  onURLChange?: (url: string) => void
}

export const WebViewModal = (props: Props) => {
  const { url, isOpen, onClose, onURLChange } = props
  const { color } = useMixins()

  const insets = useSafeAreaInsets()


  return (
    <Modal
      visible={isOpen}
      animationType='slide'
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View style={{
        paddingTop: IS_IOS ? insets.top : 0,
        paddingBottom: insets.bottom,
        flex: 1,
        backgroundColor: color.background
      }}>
        <View style={[commonStyles.SECTION_PADDING, {
          borderBottomColor: color.line,
          borderBottomWidth: 0.5
        }]}>
          <Header
            goBack={onClose}
          />
        </View>
        <WebView
          incognito
          startInLoadingState
          renderLoading={() => <OverlayLoading />}
          source={{ uri: url }}
          onShouldStartLoadWithRequest={request => {
            onURLChange && onURLChange(request.url)

            // Prevent self deep linking
            if (request.url.startsWith('com.cystack.locker')) {
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
