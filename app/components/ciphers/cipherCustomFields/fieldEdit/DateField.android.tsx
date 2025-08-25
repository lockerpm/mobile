import { Keyboard, StyleSheet, TouchableOpacity } from "react-native"
import moment from "moment"
import { DateTimePickerAndroid, DateTimePickerEvent } from "@react-native-community/datetimepicker"
import { FieldType } from "core/enums"
import { useAppLocale } from "@/i18n"
import { Text } from "app/components/cores"
import { useAppTheme } from "@/utils/useAppTheme"

type Props = {
  type: FieldType
  value: string
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
  const {
    theme: { colors },
  } = useAppTheme()
  const { value, onChange, type } = props
  const { lang } = useAppLocale()

  const dateFormat = type === FieldType.MonthYear ? "MM/yyyy" : getDateFormat(lang)

  const dateValue = (() => {
    return moment(value || undefined, value ? dateFormat : undefined).toDate()
  })()

  const onChangeDate = (event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      const val = moment(date).format(dateFormat)
      onChange(val)
    }
  }

  const showDatepicker = () => {
    Keyboard.dismiss()
    DateTimePickerAndroid.open({
      value: dateValue,
      onChange: onChangeDate,
      mode: "date",
    })
  }

  return (
    <TouchableOpacity onPress={showDatepicker} style={styles.pt10}>
      <Text color={value ? colors.text : colors.label} text={value || dateFormat}></Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  pt10: {
    alignItems: "flex-start",
    justifyContent: "center",
    paddingVertical: 8,
  },
})
