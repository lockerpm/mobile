import React, { useState } from 'react'
import { TextInput, View } from 'react-native'
import { Icon } from '../../../cores'
import { FieldType } from 'core/enums'
import { useTheme } from 'app/services/context'


type Props = {
  type: FieldType
  value: string
  placeholder: string
  onChange: (val: string) => void
}

export const TextField = (props: Props) => {
  const { value, onChange, placeholder, type } = props
  const { colors } = useTheme()

  const [isFocus, setIsFocus] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const keyboardType = (() => {
    switch (type) {
      case FieldType.Phone:
        return 'phone-pad'
      case FieldType.URL:
        return 'url'
      default:
        return 'default'
    }
  })()

  return (
    <View style={{
      borderBottomWidth: 1,
      borderBottomColor: isFocus ? colors.primary : colors.border,
      flexDirection: 'row',
      alignItems: 'center'
    }}>
      <TextInput
        secureTextEntry={type === FieldType.Hidden && !isVisible}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        selectionColor={colors.primary}
        keyboardType={keyboardType}
        style={{
          color: colors.title,
          fontSize: 16,
          paddingVertical: 10,
          flex: 1
        }}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
      />

      {
        type === FieldType.Hidden && (
          <Icon
            icon={isVisible ? "eye-slash" : "eye"}
            size={18}
            onPress={() => {
              setIsVisible(!isVisible)
            }}
            containerStyle={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30
            }}
          />
        )
      }
    </View>
  )
}
