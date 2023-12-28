import React, { useEffect, useState } from "react"
import { NativeModules, StyleProp, TouchableOpacity, View, ViewStyle } from "react-native"
import { Button, Icon, ImageIconTypes, ImageIcon, Text, Toggle } from "app/components/cores"
import { useTheme } from "app/services/context"
import { Dialog } from "react-native-ui-lib"
import { useHelper } from "app/services/hook"
import { IS_IOS } from "app/config/constants"

const { VinCssSsoLoginModule } = NativeModules

interface Props {
  /**
   * is sheet visible
   */
  isOpen: boolean
  /**
   * Callback function when bottom sheet closed
   */
  onClose: () => void

  login: (code: ANDROID_PWL_METHOD) => void
}

export const enum ANDROID_PWL_METHOD {
  NFC,
  USB,
}

export const AdnroidPasswordlessOptions = ({ isOpen, onClose, login }: Props) => {
  const { colors } = useTheme()
  const { translate } = useHelper()

  const [isSelectMethod, setSelectMethod] = useState<ANDROID_PWL_METHOD>(ANDROID_PWL_METHOD.USB)

  const [nfcAuthen, setNfcAuthen] = useState(false)
  const [usbAuthen, setUsbAuthen] = useState(false)

  const showWebauthOpeions = async () => {
    const { FEATURE_USB_HOST, FEATURE_NFC } = VinCssSsoLoginModule.getConstants()

    const nfcUsable = await VinCssSsoLoginModule.hasSystemFeature(FEATURE_NFC)
    if (nfcUsable) {
      setNfcAuthen(true)
      setSelectMethod(ANDROID_PWL_METHOD.NFC)
    }
    const usbUsable = await VinCssSsoLoginModule.hasSystemFeature(FEATURE_USB_HOST)
    if (usbUsable) {
      setUsbAuthen(true)
      setSelectMethod(ANDROID_PWL_METHOD.USB)
    }
  }

  useEffect(() => {
    !IS_IOS && showWebauthOpeions()
  }, [])

  const $containerStyle: StyleProp<ViewStyle> = [
    {
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      backgroundColor: colors.block,
      paddingBottom: 32,
    },
  ]

  const header = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          backgroundColor: colors.block,
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
      >
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
      supportedOrientations={["portrait", "landscape"]}
      panDirection={null}
    >
      <View style={{ paddingHorizontal: 16, backgroundColor: colors.block }}>

        {usbAuthen && (
          <Options
            title={"USB"}
            label={translate('onBoarding.usb')}
            icon="usb"
            isSelect={isSelectMethod === ANDROID_PWL_METHOD.USB}
            action={() => {
              setSelectMethod(ANDROID_PWL_METHOD.USB)
            }}
          />
        )}
        {nfcAuthen && (
          <Options
            title={"NFC"}
            label={translate('onBoarding.nfc')}
            icon="security-key"
            isSelect={isSelectMethod === ANDROID_PWL_METHOD.NFC}
            action={() => {
              setSelectMethod(ANDROID_PWL_METHOD.NFC)
            }}
          />
        )}
      </View>

      <Button
        text={translate("common.continue")}
        style={{
          borderRadius: 8,
          width: 120,
          marginTop: 16,
          alignSelf: "center",
        }}
        onPress={() => {
          login(isSelectMethod)
          onClose()
        }}
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
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            maxWidth: "90%",
          }}
        >
          <ImageIcon icon={icon} size={32} />
          <View
            style={{
              marginLeft: 12,
            }}
          >
            <Text text={title} />
            <Text preset="label" text={label} size="base" style={{ maxWidth: "90%" }} />
          </View>
        </View>

        <Toggle  disabled={true} value={isSelect} />
      </View>
    </TouchableOpacity>
  )
}
