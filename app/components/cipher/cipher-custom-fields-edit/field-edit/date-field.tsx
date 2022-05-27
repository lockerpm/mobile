import React from 'react'
import { View } from 'react-native'
import { FieldType } from '../../../../../core/enums'
import moment from 'moment'
import { DateTimePicker } from 'react-native-ui-lib'
import { useMixins } from '../../../../services/mixins'


type Props = {
  type: FieldType
  value: string
  placeholder: string
  onChange: (val: string) => void
}

export const DateField = (props: Props) => {
  const { value, onChange, placeholder, type } = props
  const { color } = useMixins()

  const dateFormat = type === FieldType.MonthYear ? 'MM/yyyy' : 'DD/MM/yyyy'

  const dateValue = (() => {
    return moment(value || undefined, value ? dateFormat : undefined).toDate()
  })()

  return (
    <View style={{
      paddingTop: 10
    }}>
      <DateTimePicker
        value={value ? dateValue : undefined}
        placeholder={placeholder}
        mode={'date'}
        dateFormat={dateFormat}
        enableErrors={false}
        onChange={(date: Date) => {
          const val = moment(date).format(dateFormat)
          onChange(val)
        }}
        color={color.textBlack}
        placeholderTextColor={color.text}
      />
    </View>
  )
}
