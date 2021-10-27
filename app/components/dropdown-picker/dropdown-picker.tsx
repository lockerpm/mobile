import React, { useState } from "react"
import { StyleProp, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color, fontSize } from "../../theme"
import { Text } from "../text/text"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
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
}

export const DropdownPicker = observer(function DropdownPicker(props: DropdownPickerProps) {
  const { style, items, setItems, value, setValue, placeholder, loading, emptyText, multiple } = props

  const [open, setOpen] = useState(false)

  return (
    <DropDownPicker
      mode="BADGE"
      badgeDotColors={color.palette.green}
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
        borderColor: color.line
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
        borderColor: color.line
      }}
      placeholderStyle={{
        color: color.text
      }}
      TickIconComponent={() => <IoniconsIcon name="checkmark" color={color.palette.green} size={20} />}
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
})
