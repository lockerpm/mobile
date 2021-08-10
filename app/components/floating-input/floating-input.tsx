import React, { useState } from "react"
import { StyleProp, TextInput, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color } from "../../theme"
import { Text, Button } from ".."
import Icon from 'react-native-vector-icons/FontAwesome'


export interface FloatingInputProps {
  style?: StyleProp<ViewStyle>,
  inputStyle?: StyleProp<ViewStyle>,
  isRequired?: boolean,
  isInvalid?: boolean,
  label: string,
  value?: string,
  onChangeText?: Function,
  isPassword?: boolean,
  fixedLabel?: boolean,
  editable?: boolean,
  disabled?: boolean,
  buttonRight?: JSX.Element
}

const BUTTON_BASE: ViewStyle = {
  position: 'absolute',
  zIndex: 100,
  top: 16,
  right: 0
}

/**
 * Describe your component here
 */
export const FloatingInput = observer(function FloatingInput(props: FloatingInputProps) {
  const { 
    style, inputStyle, isInvalid, isRequired, label, value, onChangeText, isPassword,
    fixedLabel, editable = true, disabled, buttonRight
  } = props

  const [isFocused, setFocus] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View style={[
      {
        borderBottomColor: isInvalid ? color.error : isFocused ? color.palette.green : color.line,
        borderBottomWidth: 1,
        height: 48
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
            fontSize: isFocused || !!value || fixedLabel ? 10 : 14
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
      <TextInput
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onChangeText={(txt) => onChangeText(txt)}
        value={value}
        style={[{
          fontSize: 12,
          paddingTop: 18,
          paddingBottom: 0,
          paddingRight: isPassword ? 25 : 0,
          color: disabled ? color.disabled : color.textBlack
        }, inputStyle]}
        secureTextEntry={isPassword && !showPassword}
        editable={editable && !disabled}
      />
      {
        isPassword && (
          <Button
            preset="link"
            onPress={() => setShowPassword(!showPassword)}
            style={BUTTON_BASE}
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
        buttonRight && (
          <View style={BUTTON_BASE}>
            {buttonRight}
          </View>
        )
      }
    </View>
  )
})
