import * as React from "react"
import Picker from "react-native-ui-lib/picker"
import { fontSize } from "../../theme"
import { StyleProp, ViewStyle } from "react-native"
import { useMixins } from "../../services/mixins"
import { SearchBar } from "../search-bar/search-bar"


type Option = {
  label: string
  value: string | number | null
  disabled?: boolean
}

export interface SelectProps {
  style?: StyleProp<ViewStyle>
  value: string | number | null
  onChange: (value: string | number | null) => void
  renderSelected?: (item: Option) => React.ReactNode
  options: Option[]
  floating?: boolean
  placeholder?: string
  showSearch?: boolean
  searchPlaceholder?: string
  title?: string
}

/**
 * Describe your component here
 */
export const Select = (props: SelectProps) => {
  const { translate, color } = useMixins()
  
  const { 
    style, value, onChange, options,
    floating, renderSelected, placeholder, title,
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
      onChange={(item: Option) => onChange(item.value)}
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
          backgroundColor: color.background
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
        />
      ))}
    </Picker>
  )
}
