import * as React from "react"
import { observer } from "mobx-react-lite"
import Picker from "react-native-ui-lib/picker"
import { color, fontSize } from "../../theme"
import { StyleProp, ViewStyle } from "react-native"
import { useMixins } from "../../services/mixins"


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
}

/**
 * Describe your component here
 */
export const Select = observer(function Select(props: SelectProps) {
  const { translate } = useMixins()
  
  const { 
    style, value, onChange, options,
    floating, renderSelected, placeholder, 
    showSearch, searchPlaceholder = translate('common.search')
  } = props

  const defaultOption = {
    value: null,
    label: placeholder
  }

  return (
    <Picker
      style={style}
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
    >
      {options.map((option) => (
        <Picker.Item 
          key={option.value} 
          value={option.value} 
          label={option.label} 
          disabled={option.disabled}
          // @ts-ignore
          labelStyle={{
            fontSize: fontSize.p
          }}
          selectedIconColor={color.palette.green}
        />
      ))}
    </Picker>
  )
})
