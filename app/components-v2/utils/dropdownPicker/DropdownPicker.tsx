import { Icon, Text } from "../../cores"
import { useTheme } from "app/services/context"
import React, { useState } from "react"
import { StyleProp, ViewStyle } from "react-native"
import DropDownPicker from 'react-native-dropdown-picker'


export interface DropdownPickerProps {
  style?: StyleProp<ViewStyle>
  items: {
    label: string,
    value: any
  }[]
  setItems: React.Dispatch<React.SetStateAction<any>>
  value: any
  setValue: React.Dispatch<React.SetStateAction<any>>
  placeholder?: string
  loading?: boolean
  emptyText?: string
  multiple?: boolean
  isDisabled?: boolean
  zIndex?: number
  zIndexInverse?: number
}

export const DropdownPicker = (props: DropdownPickerProps) => {
  const {
    style, items, setItems, value, setValue, placeholder, loading, emptyText,
    multiple, isDisabled, zIndex, zIndexInverse
  } = props
  const { colors } = useTheme()

  const [open, setOpen] = useState(false)

  return (
    <DropDownPicker
      zIndex={zIndex}
      zIndexInverse={zIndexInverse}
      disabled={isDisabled}
      disabledStyle={{
        opacity: 0.4
      }}
      mode="BADGE"
      badgeDotColors={colors.primary}
      badgeColors={colors.block}
      multiple={multiple}
      loading={loading}
      placeholder={placeholder}
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={setValue}
      setItems={setItems}
      style={[{
        borderColor: colors.border,
        backgroundColor: colors.background
      }, style]}
      labelStyle={{
        color: colors.title,
        fontSize: 16
      }}
      textStyle={{
        color: colors.title,
        fontSize: 16
      }}
      dropDownContainerStyle={{
        borderColor: colors.border,
        backgroundColor: colors.background
      }}
      placeholderStyle={{
        color: colors.secondaryText
      }}
      TickIconComponent={() => <Icon icon="check" color={colors.primary} size={20} />}
      disabledItemLabelStyle={{
        opacity: 0.4
      }}
      ListEmptyComponent={emptyText ? () => (
        <Text
          text={emptyText}
          style={{
            fontSize: 14,
            textAlign: 'center',
            marginHorizontal: 15,
            marginVertical: 10
          }}
        />
      ) : undefined}
    />
  )
}
