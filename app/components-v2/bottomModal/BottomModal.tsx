import React from 'react'
import { ColorValue, View } from 'react-native'
import { Icon, Text } from 'app/components/cores'
import Modal from 'react-native-modal'
import { TxKeyPath } from 'app/i18n'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@react-navigation/native'

interface Props {
  isOpen: boolean
  onClose: () => void
  title?: string
  titleTx?: TxKeyPath
  children?: React.ReactNode
  backgroundColor?: ColorValue
}

export const ABottomModal = ({
  isOpen,
  onClose,
  title,
  titleTx,
  children,
  backgroundColor,
}: Props) => {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <Modal
      avoidKeyboard
      isVisible={isOpen}
      animationIn={'slideInUp'}
      animationOut={'slideOutDown'}
      onBackdropPress={onClose}
      style={{
        margin: 0,
        paddingTop: insets.top,
        justifyContent: 'flex-end',
      }}
    >
      <View
        style={{
          borderTopLeftRadius: 12,
          borderTopEndRadius: 12,
          backgroundColor: backgroundColor || colors.background,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <View
          style={{
            height: 56,
            padding: 6,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
          }}
        >
          <Text
            preset="bold"
            text={title || ''}
            tx={titleTx}
            numberOfLines={1}
            style={{ textAlign: 'left', width: '100%' }}
          />
          <Icon
            icon="x"
            onPress={onClose}
            containerStyle={{
              position: 'absolute',
              right: 16,
            }}
          />
        </View>

        {children}
      </View>
    </Modal>
  )
}
