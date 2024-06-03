import React, { useState } from "react"
import { StyleProp, TextInputProps, View, ViewStyle, TextInput } from "react-native"
import { Text, Icon } from "../../cores"
import { ScrollView } from "react-native-gesture-handler"
import { useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"


interface Props extends TextInputProps {
  outerRef?: any
  style?: StyleProp<ViewStyle>
  inputStyle?: StyleProp<ViewStyle>
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
    label,
    copyAble,
    value,
    buttonRight,
    ...rest
  } = props
  const { colors } = useTheme()
  const { copyToClipboard } = useHelper()

  // ----------------- PARAMS -----------------

  const [isFocus, setIsFocus] = useState(false)

  // ----------------- RENDER -----------------

  const $containerStyle: ViewStyle = {
    borderColor: isFocus ? colors.primary : colors.disable,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  }

  const BUTTON_CONTAINER: ViewStyle = {
    position: 'absolute',
    zIndex: 100,
    top: 20,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center'
  }


  const INPUT_CONTENT_CONTAINER = {
    paddingRight: 35 * ((copyAble ? 1 : 0) + (buttonRight ? 1 : 0)),
    maxHeight: 100
  }

  return (
    <View style={style}>
      <Text
        preset="label"
        size="base"
        text={label}
        style={{
          marginBottom: 5
        }}
      />

      {
        (props.editable === false) ? (
          <ScrollView style={INPUT_CONTENT_CONTAINER}>
            <Text
              text={value}
            />
          </ScrollView>
        ) : (
          <View style={$containerStyle}>
            <TextInput
              multiline
              ref={outerRef}
              value={value}
              autoCapitalize="none"
              selectionColor={colors.primary}
              onFocus={() => {
                setIsFocus(true)
              }}
              onBlur={() => {
                setIsFocus(false)
              }}
              placeholderTextColor={colors.secondaryText}
              style={[INPUT_CONTENT_CONTAINER, {
                fontSize: 16,
                color: colors.title,
                textAlignVertical: 'top',
                paddingVertical: 0,
                minHeight: 50
              }, inputStyle]}
              {...rest}
            />
          </View>
        )
      }
      {/* Input end */}


      {/* Button right */}
      <View style={BUTTON_CONTAINER}>
        {
          copyAble && (

            <Icon
              icon="copy"
              size={18}
              onPress={() => {
                copyToClipboard(value)
              }}
              containerStyle={{
                width: 35,
                height: 35,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          )
        }
        {
          buttonRight && (
            <View style={{
              width: 35,
              height: 35,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {buttonRight}
            </View>
          )
        }
      </View>
      {/* Button right end */}
    </View>
  )
}
