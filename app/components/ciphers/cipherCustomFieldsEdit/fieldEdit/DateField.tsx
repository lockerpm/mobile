import React from 'react'
import { View } from 'react-native'
import moment from 'moment'
import { DateTimePicker } from 'react-native-ui-lib'
import { FieldType } from 'core/enums'
import { useTheme } from 'app/services/context'


type Props = {
  type: FieldType
  value: string
  placeholder: string
  onChange: (val: string) => void
}

export const DateField = (props: Props) => {
  const { value, onChange, placeholder, type } = props
  const { colors } = useTheme()

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
        color={colors.title}
        placeholderTextColor={colors.secondaryText}
      />
    </View>
  )
}
