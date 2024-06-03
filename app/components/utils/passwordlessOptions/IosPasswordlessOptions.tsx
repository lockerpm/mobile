import React from 'react'
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, Icon, ImageIconTypes, ImageIcon, Text, Logo, Toggle } from '../../cores'
import { useTheme } from 'app/services/context'
import { Dialog } from 'react-native-ui-lib'
import { useHelper } from 'app/services/hook'

interface Props {
  /**
   * Sheet title header
   */
  title: string
  /**
   * Description
   */
  label: string
  /**
   * is sheet visible
   */
  isOpen: boolean
  /**
   * Callback function when bottom sheet closed
   */
  onClose: () => void

  /**
   * Is save credentials in keychain
   */
  isIcloudSelected: boolean

  setIsIcloudSelected: (val: boolean) => void
  action: () => void
}

export const IosPasswordlessOptions = ({
  title,
  label,
  isOpen,
  onClose,
  isIcloudSelected,
  setIsIcloudSelected,
  action,
}: Props) => {
  const { colors } = useTheme()
  const { translate } = useHelper()
  const inset = useSafeAreaInsets()
  const $containerStyle: StyleProp<ViewStyle> = [
    {
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      backgroundColor: colors.block,
      paddingBottom: inset.bottom + 16,
    },
  ]

  const header = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.block,
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
      >
        <Text preset="bold" text={title} style={{ fontSize: 24, lineHeight: 28 }} />
        <Icon icon="x-circle" size={24} onPress={onClose} />
      </View>
    )
  }
  return (
    <Dialog
      bottom
      width="100%"
      visible={isOpen}
      onDismiss={onClose}
      containerStyle={$containerStyle}
      renderPannableHeader={header}
      supportedOrientations={['portrait', 'landscape']}
      panDirection={null}
    >
      <View style={{ paddingHorizontal: 16, backgroundColor: colors.block }}>
        <Logo
          preset="app-logo-secondary"
          style={{ alignSelf: 'center', marginBottom: 16, width: 60, height: 60 }}
        />
        <Text text={label} style={{ textAlign: 'center' }} />

        <Options
          title={translate('passkey.sign_up.keychain.title')}
          label={translate('passkey.sign_up.keychain.label')}
          icon="keychain"
          isSelect={isIcloudSelected}
          action={() => {
            setIsIcloudSelected(!isIcloudSelected)
          }}
        />
        <Options
          title={translate('passkey.sign_up.security_key.title')}
          label={translate('passkey.sign_up.security_key.label')}
          icon="security-key"
          isSelect={!isIcloudSelected}
          action={() => {
            setIsIcloudSelected(!isIcloudSelected)
          }}
        />
      </View>

      <Button
        text={translate('common.continue')}
        style={{
          borderRadius: 8,
          width: 120,
          marginTop: 16,
          alignSelf: 'center',
        }}
        onPress={action}
      />
    </Dialog>
  )
}

interface OptionsProps {
  isSelect: boolean
  action: () => void
  title: string
  label: string
  icon: ImageIconTypes
}

const Options = ({ title, label, icon, isSelect, action }: OptionsProps) => {
  const { colors } = useTheme()
  return (
    <TouchableOpacity onPress={action}>
      <View
        style={{
          marginTop: 12,
          padding: 16,
          paddingVertical: 8,
          backgroundColor: colors.background,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            maxWidth: '90%',
          }}
        >
          <ImageIcon icon={icon} size={32} />
          <View
            style={{
              marginLeft: 12,
            }}
          >
            <Text text={title} />
            <Text preset="label" text={label} size="base" style={{ maxWidth: '90%' }} />
          </View>
        </View>

        <Toggle disabled={true} value={isSelect} />
      </View>
    </TouchableOpacity>
  )
}
