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
  fixedLabel?: boolean
}

/**
 * Describe your component here
 */
export const FloatingInput = observer(function FloatingInput(props: FloatingInputProps) {
  const { 
    style, inputStyle, isInvalid, isRequired, label, value, onChangeText, isPassword,
    fixedLabel
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
          paddingRight: isPassword ? 25 : 0
        }, inputStyle]}
        secureTextEntry={isPassword && !showPassword}
      />
      {
        isPassword && (
          <Button
            preset="link"
            onPress={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              zIndex: 100,
              top: 16,
              right: 0
            }}
          >
            <Icon 
              name={showPassword ? "eye-slash" : "eye"} 
              size={18} 
              color={color.text} 
            />
          </Button>
        )
      }
    </View>
  )
})
