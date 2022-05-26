import React, { useState } from 'react'
import { TextInput, View } from 'react-native'
import { useMixins } from '../../../../services/mixins'
import { fontSize } from '../../../../theme'


type Props = {
  value: string
  placeholder: string
  onChange: (val: string) => void
}

export const TextField = (props: Props) => {
  const { value, onChange, placeholder } = props
  const { color } = useMixins()

  const [isFocus, setIsFocus] = useState(false)

  return (
    <View style={{
      borderBottomWidth: 1,
      borderBottomColor: isFocus ? color.primary : color.line
    }}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={color.text}
        selectionColor={color.primary}
        style={{
          color: color.textBlack,
          fontSize: fontSize.p,
          paddingVertical: 10,
          flex: 1
        }}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
      />
    </View>
  )
}
