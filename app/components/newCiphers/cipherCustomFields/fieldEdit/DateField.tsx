import React from "react"
import { View } from "react-native"
import moment from "moment"
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker"
import { FieldType } from "core/enums"
import { useTheme } from "app/services/context"
import { useStores } from "app/models"

type Props = {
  type: FieldType
  value: string
  placeholder: string
  onChange: (val: string) => void
}

function getDateFormat(locale: string) {
  return (
    {
      vi: "DD/MM/YYYY",
      en: "MM/DD/YYYY",
      zh: "YYYY/MM/DD",
    }[locale] || "DD/MM/yyyy"
  )
}

export const DateField = (props: Props) => {
  const { value, onChange, placeholder, type } = props
  const { colors } = useTheme()
  const { user } = useStores()

  const dateFormat = type === FieldType.MonthYear ? "MM/yyyy" : getDateFormat(user.language)

  const dateValue = (() => {
    return moment(value || undefined, value ? dateFormat : undefined).toDate()
  })()

  return (
    <View
      style={{
        paddingTop: 10,
      }}
    >
      <DateTimePicker
        value={dateValue}
        // placeholder={placeholder}
        mode={"date"}
        // dateFormat={dateFormat}
        // enableErrors={false}
        onChange={(event: DateTimePickerEvent, date: Date | undefined) => {
          const val = moment(date).format(dateFormat)
          onChange(val)
        }}
        // color={colors.title}
        // placeholderTextColor={colors.secondaryText}
      />
    </View>
  )
}
