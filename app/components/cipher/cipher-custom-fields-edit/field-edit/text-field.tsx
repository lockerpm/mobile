import React, { useState } from 'react'
import { TextInput, View } from 'react-native'
import { FieldType } from '../../../../../core/enums'
import { useMixins } from '../../../../services/mixins'
import { commonStyles, fontSize } from '../../../../theme'
import Icon from 'react-native-vector-icons/FontAwesome'
import { Button } from '../../../button/button'


type Props = {
  type: FieldType
  value: string
  placeholder: string
  onChange: (val: string) => void
}

export const TextField = (props: Props) => {
  const { value, onChange, placeholder, type } = props
  const { color } = useMixins()

  const [isFocus, setIsFocus] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  return (
    <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
      borderBottomWidth: 1,
      borderBottomColor: isFocus ? color.primary : color.line
    }]}>
      <TextInput
        secureTextEntry={type === FieldType.Hidden && !isVisible}
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

      {
        type === FieldType.Hidden && (
          <Button
            preset="link"
            onPress={() => {
              setIsVisible(!isVisible)
            }}
            style={{
              alignItems: 'center',
              width: 35,
              height: 30
            }}
          >
            <Icon
              name={isVisible ? "eye-slash" : "eye"}
              size={18}
              color={color.text}
            />
          </Button>
        )
      }
    </View>
  )
}
