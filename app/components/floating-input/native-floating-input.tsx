import React, { useState } from "react"
import { StyleProp, View, ViewStyle, TextInput, TextInputProps } from "react-native"
import { observer } from "mobx-react-lite"
import { color, fontSize } from "../../theme"
import { Button } from "../button/button"
import { Text } from "../text/text"
import Icon from 'react-native-vector-icons/FontAwesome'
import { TextInputMask, TextInputMaskTypeProp, TextInputMaskOptionProp } from "react-native-masked-text"
import { useMixins } from "../../services/mixins"


export interface NativeFloatingInputProps extends TextInputProps {
  style?: StyleProp<ViewStyle>,
  inputStyle?: StyleProp<ViewStyle>,
  isRequired?: boolean,
  isInvalid?: boolean,
  label: string,
  isPassword?: boolean,
  fixedLabel?: boolean,
  editable?: boolean,
  disabled?: boolean,
  buttonRight?: JSX.Element,
  textarea?: boolean,
  maskType?: TextInputMaskTypeProp,
  maskOptions?: TextInputMaskOptionProp,
  copyAble?: boolean
}

/**
 * Describe your component here
 */
export const NativeFloatingInput = observer(function NativeFloatingInput(props: NativeFloatingInputProps) {
  const {
    style, inputStyle, isInvalid, isRequired, label, isPassword, value, placeholder,
    fixedLabel, editable = true, disabled, buttonRight, textarea, onChangeText,
    maskType, maskOptions, copyAble,
    ...rest
  } = props

  const { copyToClipboard } = useMixins()
  const [isFocused, setFocus] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const textInputProps = {
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: [{
      fontSize: fontSize.p,
      paddingTop: 20,
      paddingBottom: 0,
      paddingRight: isPassword ? 25 : 0,
      color: disabled ? color.disabled : color.textBlack
    }, inputStyle],
    secureTextEntry: isPassword && !showPassword,
    editable: editable && !disabled,
    multiline: textarea,
    numberOfLines: textarea ? 4 : 1,
    value,
    placeholder: isFocused || fixedLabel ? placeholder : undefined,
    ...rest
  }

  const BUTTON_CONTAINER: ViewStyle = {
    position: 'absolute',
    zIndex: 100,
    top: textarea ? 0 : 16,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center'
  }

  const BUTTON: ViewStyle = {
    alignItems: 'center',
    width: 30,
  }

  return (
    <View style={[
      {
        borderBottomColor: isInvalid ? color.error : isFocused ? color.palette.green : color.line,
        borderBottomWidth: 1,
        height: textarea ? 92 : 50
      }, style
    ]}>
      <View
        style={{
          position: 'absolute',
          top: isFocused || !!value || fixedLabel ? 0 : 12,
          left: fixedLabel ? 0 : 3,
        }}
      >
        <Text
          style={{
            fontSize: isFocused || !!value || fixedLabel ? fontSize.small : fontSize.p,
            marginTop: isRequired ? -5 : undefined
          }}
        >
          {label}
          {
            isRequired && (
              <Text
                text="*"
                style={{
                  color: color.error
                }}
              />
            )
          }
        </Text>
      </View>
      {
        maskType || maskOptions ? (
          <TextInputMask
            type={maskType || 'custom'}
            options={maskOptions}
            {...textInputProps}
            onChangeText={(text) => onChangeText && onChangeText(text)}
          />
        ) : (
          <TextInput
            {...textInputProps}
            onChangeText={(text) => onChangeText && onChangeText(text)}
          />
        )
      }

      <View style={BUTTON_CONTAINER}>
        {
          isPassword && (
            <Button
              preset="link"
              onPress={() => setShowPassword(!showPassword)}
              style={BUTTON}
            >
              <Icon
                name={showPassword ? "eye-slash" : "eye"}
                size={16}
                color={color.text}
              />
            </Button>
          )
        }
        {
          copyAble && (
            <Button
              preset="link"
              onPress={() => copyToClipboard(value)}
              style={BUTTON}
            >
              <Icon
                name="copy"
                size={15}
                color={color.text}
              />
            </Button>
          )
        }
        {
          buttonRight && (
            <View style={BUTTON}>
              {buttonRight}
            </View>
          )
        }
      </View>
    </View>
  )
})
