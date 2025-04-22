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
  value: string
}

export const Textarea = (props: Props) => {
  const { outerRef, style, inputStyle, editable = true, label, value, ...rest } = props
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

  return (
    <View style={style}>
      <Text
        preset="label"
        size="base"
        text={label}
        style={{
          marginBottom: 5,
        }}
      />

      {!editable && (
        <ScrollView bounces={false} style={$containerStyle}>
          <Text text={value} />
          <Icon
            icon="copy"
            size={18}
            onPress={() => {
              copyToClipboard(value)
            }}
            containerStyle={$icon}
          />
        </ScrollView>
      )}
      {editable && (
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
            style={[
              {
                fontSize: 16,
                color: colors.title,
                textAlignVertical: "top",
                paddingVertical: 0,
                minHeight: 50,
              },
              inputStyle,
            ]}
            {...rest}
          />
        </View>
      )}
    </View>
  )
}

const $icon: ViewStyle = {
  position: "absolute",
  zIndex: 100,
  top: 0,
  right: 0,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
}
