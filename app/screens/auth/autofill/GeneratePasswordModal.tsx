import React, { useEffect, useRef, useState } from "react"
import { Text, BottomModal, Button, Icon } from "app/components/cores"
import { NativeModules, View, ViewStyle } from "react-native"
import { useCipherHelper, useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"
import { PasswordStrength } from "app/components/utils"
import { Slider, Checkbox } from "react-native-ui-lib"
import { useCoreService } from "app/services/coreService"


interface Props {
  isOpen: boolean
  onClose: () => void
}

const { RNAutofillServiceAndroid } = NativeModules


export const GeneratePasswordModal = ({ isOpen, onClose }: Props) => {
  const { colors } = useTheme()
  const { copyToClipboard, translate } = useHelper()
  const { getPasswordStrength } = useCipherHelper()
  const { passwordGenerationService } = useCoreService()

  const [password, setPassword] = useState("")
  const [sliderValue, setSliderValue] = useState(16)
  const [uppercase, setuppercase] = useState(true)
  const [lowercase, setlowercase] = useState(true)
  const [number, setnumber] = useState(true)
  const [special, setspecial] = useState(true)
  const [ambiguous, setambiguous] = useState(false)

  const passwordLength = useRef(16)

  const OPTIONS = [
    {
      label: translate("pass_generator.use_upper"),
      key: uppercase,
      action: setuppercase,
    },
    {
      label: translate("pass_generator.use_lower"),
      key: lowercase,
      action: setlowercase,
    },
    {
      label: translate("pass_generator.use_digits"),
      key: number,
      action: setnumber,
    },
    {
      label: translate("pass_generator.use_symbol"),
      key: special,
      action: setspecial,
    },
    {
      label: translate("pass_generator.avoid_ambiguous"),
      key: ambiguous,
      action: setambiguous,
    },
  ]
  const regenerate = async () => {
    const opt = {
      uppercase,
      lowercase,
      number,
      special,
      ambiguous,
      length: passwordLength.current,
    }
    if (!opt.lowercase && !opt.uppercase && !opt.number && !opt.special) {
      opt.lowercase = true
    }
    const val = await passwordGenerationService.generatePassword(opt)
    setPassword(val)
  }

  // Watchers
  useEffect(() => {
    if (isOpen) {
      regenerate()
    }
  }, [lowercase, uppercase, number, special, ambiguous, isOpen])

  const $block: ViewStyle = {
    marginTop: 16,
    backgroundColor: colors.block,
    padding: 16,
    borderRadius: 12,
  }
  return (
    <BottomModal isOpen={isOpen} title={translate("pass_generator.title")} onClose={onClose}>
      <View style={$block}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text text={password} style={{ flex: 1, fontSize: 20 }} />
          <Icon icon="copy" size={18} onPress={() => copyToClipboard(password)} />
        </View>
        <PasswordStrength preset="text" value={getPasswordStrength(password).score} />
      </View>
      <View style={$block}>
        {/* Password length */}
        <Text text={`${translate("common.length")}: ${sliderValue}`} />
        <Slider
          value={sliderValue}
          thumbTintColor={colors.primary}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.background}
          minimumValue={8}
          maximumValue={64}
          step={1}
          onValueChange={(value) => {
            passwordLength.current = value
          }}
          onSeekEnd={() => {
            regenerate()
            setSliderValue(passwordLength.current)
          }}
        />
        {/* Password length end */}

        <View style={{ marginTop: 10 }}>
          {OPTIONS.map((item) => (
            <Checkbox
              key={item.label}
              value={item.key}
              accessibilityLabel={item.label}
              color={colors.primary}
              label={item.label}
              onValueChange={item.action}
              style={{
                marginVertical: 7,
              }}
              labelStyle={{
                color: colors.title,
                fontSize: 16,
              }}
            />
          ))}
        </View>
      </View>
      <View
        style={{
          marginTop: 16,
          flexDirection: "row",
          width: "100%",
          alignItems: "center",
        }}
      >
        <Button preset="secondary" text={translate("common.regenerate")} onPress={regenerate} style={{flex: 1}} />
        <View style={{ width: 8 }} />
        <Button text={translate("pass_generator.use_password")}  style={{flex: 1}} onPress={() => {
           RNAutofillServiceAndroid.addAutofillValue(
            '',
            '',
            password,
            '',
           ''
          )
        }} />
      </View>
    </BottomModal>
  )
}
