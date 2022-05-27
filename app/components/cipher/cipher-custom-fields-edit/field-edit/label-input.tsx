import React, { useState } from 'react'
import { TextInput, View } from 'react-native'
import { useMixins } from '../../../../services/mixins'
import { fontSize } from '../../../../theme'


type Props = {
  value: string
  onChange: (val: string) => void
}

export const LabelInput = (props: Props) => {
  const { value, onChange } = props
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
        placeholderTextColor={color.text}
        selectionColor={color.primary}
        style={{
          color: color.text,
          fontSize: fontSize.small,
          paddingTop: 0,
          paddingBottom: 4
        }}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
      />
    </View>
  )
}
