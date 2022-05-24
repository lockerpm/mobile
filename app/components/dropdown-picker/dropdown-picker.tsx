import React, { useState } from "react"
import { StyleProp, ViewStyle } from "react-native"
import { fontSize } from "../../theme"
import { Text } from "../text/text"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import DropDownPicker from 'react-native-dropdown-picker'
import { useMixins } from "../../services/mixins"


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
  const { color } = useMixins()
  
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
      badgeDotColors={color.primary}
      badgeColors={color.block}
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
        borderColor: color.line,
        backgroundColor: color.background
      }, style]}
      labelStyle={{
        color: color.textBlack,
        fontSize: fontSize.p
      }}
      textStyle={{
        color: color.textBlack,
        fontSize: fontSize.p
      }}
      dropDownContainerStyle={{
        borderColor: color.line,
        backgroundColor: color.background
      }}
      placeholderStyle={{
        color: color.text
      }}
      TickIconComponent={() => <IoniconsIcon name="checkmark" color={color.primary} size={20} />}
      disabledItemLabelStyle={{
        opacity: 0.4
      }}
      ListEmptyComponent={emptyText ? () => (
        <Text
          text={emptyText}
          style={{
            fontSize: fontSize.small,
            textAlign: 'center',
            marginHorizontal: 15,
            marginVertical: 10
          }}
        />
      ) : undefined}
    />
  )
}
