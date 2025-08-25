import { memo, useCallback, useState } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import { FieldType } from "core/enums"
import { shouldRerenderItem } from "app/utils/utils"
import { PressableIcon } from "../../../cores"
import { LabelInput } from "./LabelInput"
import { TextField } from "./TextField"
import { useAppTheme } from "@/utils/useAppTheme"
import { useAppLocale } from "@/i18n"
// @ts-ignore
import { DateField } from "./DateField"
import { OTPField } from "./OTPField"
import { ThemedStyle } from "@/theme"
import { MonthYearField } from "./MonthYearField"
type Props = {
  type: FieldType
  name: string
  value: string
  onChange: (params: { type: FieldType; name: string; value: string }) => void
  onDelete: () => void
}

export const FieldEdit = memo(
  (props: Props) => {
    const { type, name, value, onChange, onDelete } = props
    const {
      themed,
      theme: { colors },
    } = useAppTheme()
    const { translate } = useAppLocale()

    const [isFocused, setIsFocused] = useState(false)

    const onFocus = useCallback(() => {
      setIsFocused(true)
    }, [])
    const onBlur = useCallback(() => {
      setIsFocused(false)
    }, [])

    const Field = () => {
      switch (type) {
        case FieldType.Text:
        case FieldType.Hidden:
        case FieldType.URL:
        case FieldType.Email:
        case FieldType.Address:
        case FieldType.Phone:
          return (
            <TextField
              type={type}
              value={value}
              onChange={(val) => onChange({ type, name, value: val })}
              placeholder={translate("common:value")}
              onBlur={onBlur}
              onFocus={onFocus}
            />
          )
        case FieldType.Date:
          return (
            <DateField
              type={type}
              value={value}
              onChange={(val: string) => onChange({ type, name, value: val })}
            />
          )
        case FieldType.MonthYear:
          return (
            <MonthYearField
              value={value}
              onChange={(val: string) => onChange({ type, name, value: val })}
              onBlur={onBlur}
              onFocus={onFocus}
            />
          )
        case FieldType.TOTP:
          return (
            <OTPField
              value={value}
              onChange={(val: string) => onChange({ type, name, value: val })}
              placeholder={translate("common:value")}
              onBlur={onBlur}
              onFocus={onFocus}
            />
          )
      }
    }

    const $container: ViewStyle = {
      borderColor: isFocused ? colors.primary : colors.border,
    }
    return (
      <View style={[styles.container, $container]}>
        <View style={styles.flex}>
          <LabelInput
            value={name}
            onChange={(val) => onChange({ type, value, name: val })}
            onBlur={onBlur}
            onFocus={onFocus}
          />
          <View style={themed($divider)} />
          {Field()}
        </View>
        <PressableIcon
          icon="minus-circle"
          size={20}
          color={colors.error}
          containerStyle={styles.ml12}
          onPress={onDelete}
        />
      </View>
    )
  },
  shouldRerenderItem(["onChange"])
)

FieldEdit.displayName = "FieldEdit"

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  height: 1,
  backgroundColor: colors.border,
})

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  flex: {
    flex: 1,
  },
  ml12: {
    marginLeft: 12,
  },
})
