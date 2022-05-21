import React, { useState } from "react"
import { StyleProp, TextInputProps, View, ViewStyle, TextInput } from "react-native"
import { Button } from "../button/button"
import { Text } from "../text/text"
import Icon from 'react-native-vector-icons/FontAwesome'
import { useMixins } from "../../services/mixins"
import { fontSize } from "../../theme"


interface Props extends TextInputProps {
  outerRef?: any
  style?: StyleProp<ViewStyle>
  inputStyle?: StyleProp<ViewStyle>
  isRequired?: boolean
  label: string
  copyAble?: boolean
  buttonRight?: JSX.Element
  value: string
}


export const Textarea = (props: Props) => {
  const {
    outerRef,
    style,
    inputStyle,
    isRequired,
    label,
    copyAble,
    value,
    buttonRight,
    ...rest
  } = props

  const { color, copyToClipboard } = useMixins()

  // ----------------- PARAMS -----------------

  const [isFocus, setIsFocus] = useState(false)

  // ----------------- RENDER -----------------

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

  return (
    <View style={style}>
      {/* Label */}
      <Text
        text={label}
        style={{
          fontSize: fontSize.small,
          marginBottom: 5
        }}
      />
      {/* Label end */}

      {/* Input */}
      <TextInput
        multiline
        ref={outerRef}
        value={value}
        autoCapitalize="none"
        selectionColor={color.primary}
        onFocus={() => {
          setIsFocus(true)
        }}
        onBlur={() => {
          setIsFocus(false)
        }}
        placeholderTextColor={color.text}
        style={[{
          fontSize: fontSize.p,
          color: color.textBlack,
          paddingRight: 35 * ((copyAble ? 1 : 0) + (buttonRight ? 1 : 0)),
          textAlignVertical: 'top',
          paddingVertical: 0,
          minHeight: props.editable === false ? 0 : 50,
          maxHeight: 100
        }, inputStyle]}
        {...rest}
      />
      {/* Input end */}

      <View style={{
        borderBottomColor: isFocus ? color.primary : color.disabled,
        borderBottomWidth: 1,
        marginTop: 10
      }} />

      {/* Button right */}
      <View style={BUTTON_CONTAINER}>
        {
          copyAble && (
            <Button
              preset="link"
              onPress={() => {
                copyToClipboard(value)
              }}
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
}
