import * as React from "react"
import Picker from "react-native-ui-lib/picker"
import { fontSize } from "../../theme"
import { StyleProp, ViewStyle } from "react-native"
import { useMixins } from "../../services/mixins"
import { SearchBar } from "../search-bar/search-bar"
import { PickerItemProps } from "react-native-ui-lib/typings"
import { useSafeAreaInsets } from "react-native-safe-area-context"


type Option = {
  label: string
  value: string | number | null
  disabled?: boolean
}

export interface SelectProps {
  style?: StyleProp<ViewStyle>
  value: any | any[]
  onChange: (value: any | any[]) => void
  renderSelected?: (item: Option) => React.ReactNode
  options: Option[]
  floating?: boolean
  placeholder?: string
  showSearch?: boolean
  searchPlaceholder?: string
  title?: string
  multiple?: boolean
  renderItem?: (
    value: string,
    props: PickerItemProps & { isSelected: boolean },
    itemLabel: string
  ) => React.ReactNode
}

/**
 * Describe your component here
 */
export const Select = (props: SelectProps) => {
  const { translate, color } = useMixins()
  const insets = useSafeAreaInsets()

  const {
    style, value, onChange, options,
    floating, renderSelected, renderItem, placeholder, title, multiple,
    showSearch, searchPlaceholder = translate('common.search')
  } = props

  const defaultOption = {
    value: null,
    label: placeholder
  }

  return (
    <Picker
      style={[{
        color: color.textBlack
      }, style]}
      value={value}
      mode={multiple ? 'MULTI' : 'SINGLE'}
      onChange={multiple
        ? (values: any[]) => onChange(values)
        : (item: Option) => onChange(item.value)
      }
      renderPicker={floating ? undefined : (value: string | number | null) => {
        return renderSelected(options.find((item: Option) => item.value === value) || defaultOption)
      }}
      floatingPlaceholder={floating}
      placeholder={placeholder}
      showSearch={showSearch}
      searchPlaceholder={searchPlaceholder}
      floatingPlaceholderStyle={{
        fontSize: fontSize.p,
        color: color.text
      }}
      enableErrors={false}
      topBarProps={{
        title,
        titleStyle: {
          color: color.title,
          fontSize: fontSize.h5
        },
        containerStyle: {
          backgroundColor: color.background,
          paddingVertical: 5
        },
        cancelLabel: translate('common.cancel'),
        cancelButtonProps: {
          labelStyle: {
            fontSize: fontSize.p,
            color: color.text
          }
        },
        cancelIcon: null,
        doneLabel: translate('common.save'),
        doneButtonProps: {
          labelStyle: {
            fontSize: fontSize.p,
            color: color.primary
          }
        },
        doneIcon: null
      }}
      listProps={{
        style: {
          backgroundColor: color.background,
          marginBottom: insets.bottom
        }
      }}
      renderCustomSearch={({ onSearchChange }) => (
        <SearchBar
          onSearch={onSearchChange}
          style={{
            borderRadius: 0,
            paddingHorizontal: 13,
            paddingVertical: 5
          }}
        />
      )}
    >
      {options.map((option) => (
        <Picker.Item
          key={option.value}
          value={option.value}
          label={option.label}
          disabled={option.disabled}
          // @ts-ignore
          labelStyle={{
            fontSize: fontSize.p,
            color: color.textBlack
          }}
          selectedIconColor={color.primary}
          // @ts-ignore
          renderItem={renderItem}
        />
      ))}
    </Picker>
  )
}
