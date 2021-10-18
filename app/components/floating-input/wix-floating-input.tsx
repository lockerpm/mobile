import React, { useState } from "react"
import { StyleProp, View, ViewStyle, TextInputProps } from "react-native"
import { observer } from "mobx-react-lite"
import { color, fontSize } from "../../theme"
import { Button } from "../button/button"
import { Text } from "../text/text"
import Icon from 'react-native-vector-icons/FontAwesome'
import { useMixins } from "../../services/mixins"
import TextField from 'react-native-ui-lib/textField'
import { MaskService, TextInputMaskTypeProp, TextInputMaskOptionProp } from "react-native-masked-text"
import { translate } from "../../i18n"


export interface WixFloatingInputProps extends TextInputProps {
  style?: StyleProp<ViewStyle>,
  inputStyle?: StyleProp<ViewStyle>,
  isRequired?: boolean,
  isInvalid?: boolean,
  errorText?: string,
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
export const WixFloatingInput = observer(function WixFloatingInput(props: WixFloatingInputProps) {
  const {
    style, inputStyle, label, isPassword, value, placeholder,
    editable = true, disabled, buttonRight, onChangeText, copyAble, textarea,
    maskType, maskOptions, isRequired,
    ...rest
  } = props

  const { copyToClipboard } = useMixins()
  const [showPassword, setShowPassword] = useState(false)
  const [firstFocused, setFirstFocused] = useState(false)
  const [isFocus, setIsFocus] = useState(false)

  const isInvalid = props.isInvalid || (isRequired && firstFocused && !value.trim())
  const errorText = props.errorText || ((isRequired && firstFocused && !value.trim()) ? translate('error.required_data') : '')

  const BUTTON_CONTAINER: ViewStyle = {
    position: 'absolute',
    zIndex: 100,
    top: 20,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center'
  }

  const BUTTON: ViewStyle = {
    alignItems: 'center',
    width: 35,
    height: 30
  }

  const validateMask = (text: string) => {
    if (maskType || maskOptions) {
      const masked = MaskService.toMask(maskType || 'custom', text, maskOptions)
      return masked
    }
    return text
  }

  return (
    <View style={style}>
      {/* Input */}
      <TextField
        autoCapitalize="none"
        enableErrors={false}
        floatingPlaceholder
        multiline={textarea}
        floatOnFocus
        placeholder={label + (isRequired ? ' (*)' : '')}
        helperText={placeholder}
        value={value}
        editable={editable && !disabled}
        disabled={disabled}
        secureTextEntry={isPassword && !showPassword}
        transformer={validateMask}
        onChangeText={onChangeText}
        underlineColor={{ 
          focus: color.palette.green, 
          default: isInvalid ? color.error : color.disabled 
        }}
        style={[{
          fontSize: fontSize.p,
          color: color.textBlack,
          paddingRight: 35 * ((isPassword ? 1 : 0) + (copyAble ? 1 : 0) + (buttonRight ? 1 : 0))
        }, inputStyle]}
        floatingPlaceholderStyle={{
          fontSize: fontSize.p,
          color: color.text
        }}
        onFocus={() => {
          setFirstFocused(true)
          setIsFocus(true)
        }}
        onBlur={() => {
          setIsFocus(false)
        }}
        {...rest}
      />
      {/* Input end */}

      {/* Error message */}
      {
        (errorText && isInvalid && !isFocus) ? (
          <Text
            text={errorText}
            style={{
              fontSize: fontSize.small,
              color: color.error,
              marginVertical: 5
            }}
          />
        ) : null
      }
      {/* Error message end */}

      {/* Button right */}
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
                size={18}
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
                size={17}
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
      {/* Button right end */}
    </View>
  )
})
