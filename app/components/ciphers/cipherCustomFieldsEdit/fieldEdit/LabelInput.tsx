import { useTheme } from 'app/services/context'
import { typography } from 'app/theme'
import React, { useState } from 'react'
import { TextInput, View } from 'react-native'

type Props = {
  value: string
  onChange: (val: string) => void
}

export const LabelInput = (props: Props) => {
  const { value, onChange } = props
  const { colors } = useTheme()

  const [isFocus, setIsFocus] = useState(false)

  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: isFocus ? colors.primary : colors.border,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholderTextColor={colors.secondaryText}
        selectionColor={colors.primary}
        style={{
          color: colors.title,
          fontSize: 16,
          fontFamily: typography.primary.medium,
          paddingTop: 0,
          paddingBottom: 4,
        }}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
      />
    </View>
  )
}
