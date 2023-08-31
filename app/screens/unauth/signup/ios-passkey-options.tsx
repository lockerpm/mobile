import React from "react"
import { StyleProp, TouchableOpacity, View, ViewStyle } from "react-native"
import Dialog from "react-native-ui-lib/dialog"
import { useMixins } from "../../../services/mixins"
import { Text, Icon, Button } from "../../../components"
import { IconTypes, ImageIcon } from "../../../components/cores"
import CheckBox from "@react-native-community/checkbox"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface Props {
  title: string
  label: string
  isOpen: boolean
  onClose: () => void
  isIcloudSelected: boolean
  setIsIcloudSelected: (val: boolean) => void
  action: () => void
}

/**
 * is a surface containing content related to the previous screen.
 */
export const IosPasskeyOptions = ({ title, label, isOpen, onClose, isIcloudSelected , setIsIcloudSelected, action}: Props) => {
  const { color, translate } = useMixins()
  const inset = useSafeAreaInsets()
  const $containerStyle: StyleProp<ViewStyle> = [
    {
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      backgroundColor: color.block,
      paddingBottom: inset.bottom + 16,
    },
  ]

  const header = () => {
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: color.block,
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
        >
          <Text preset="bold" text={title} style={{ fontSize: 24, lineHeight: 28 }} />
          <Icon icon="x" size={24} />
        </View>
      )
  }
  return (
    <Dialog
      bottom
      width="100%"
      visible={isOpen}
      // onDialogDismissed={action}
      onDismiss={onClose}
      containerStyle={$containerStyle}
      renderPannableHeader={header}
    >
      <View style={{ paddingHorizontal: 16, backgroundColor: color.block }}>
        <ImageIcon
          icon="app-logo-secondary"
          size={60}
          style={{ alignSelf: "center", marginBottom: 16 }}
        />
        <Text
          preset="black"
          text={label}
          style={{ textAlign: "center" }}
        />

        <Options
          title={translate('passkey.sign_up.keychain.title')}
          label={translate('passkey.sign_up.keychain.label')}
          icon="keychain"
          isSelect={isIcloudSelected} 
          action={() => {
            setIsIcloudSelected(!isIcloudSelected)
        }}        />
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
          alignSelf: "center",
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
  icon: IconTypes
}

const Options = ({title, label, icon,  isSelect, action}: OptionsProps) => {
  const { color } = useMixins()
  return (
    <TouchableOpacity onPress={action}>
      <View
        style={{
          marginTop: 12,
          padding: 16,
          backgroundColor: color.background,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <ImageIcon icon={icon} size={32} />
          <View
            style={{
              marginLeft: 12,
            }}
          >
            <Text preset="black" text={title} />
            <Text text={label} style={{ fontSize: 14, maxWidth: '80%' }} />
          </View>
        </View>

        <CheckBox
          tintColors={{ true: "black", false: color.text }}
          onFillColor={color.primary}
          tintColor={color.text}
          onTintColor={color.primary}
          animationDuration={0.1}
          onCheckColor={color.white}
          style={{  width: 24,  height: 24, alignSelf: 'flex-end' }}
          disabled={true}
          value={isSelect}
       
        />
      </View>
    </TouchableOpacity>
  )
}
