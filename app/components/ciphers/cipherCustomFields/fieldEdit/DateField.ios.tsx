import { StyleSheet, TouchableOpacity } from "react-native"
import moment from "moment"
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker"
import { FieldType } from "core/enums"
import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"
import { BottomModal, Text } from "@/components/cores"
import { useState } from "react"

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
  const { value, onChange, type } = props
  const { lang } = useAppLocale()
  const { themeContext } = useAppTheme()

  const [showDatepicker, setShowDatepicker] = useState(false)

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

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setShowDatepicker(true)
        }}
        style={styles.pt10}
      >
        <Text text={value || "---"}></Text>
      </TouchableOpacity>
      <BottomModal
        isOpen={showDatepicker}
        onClose={() => {
          setShowDatepicker(false)
        }}
      >
        <DateTimePicker
          value={dateValue}
          mode={"date"}
          display="spinner"
          themeVariant={themeContext}
          onChange={onChangeDate}
        />
      </BottomModal>
    </>
  )
}

const styles = StyleSheet.create({
  pt10: {
    alignItems: "flex-start",
    justifyContent: "center",
    paddingVertical: 8,
  },
})
