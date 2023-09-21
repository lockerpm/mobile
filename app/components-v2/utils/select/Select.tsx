import * as React from "react"
import Picker from "react-native-ui-lib/picker"
import { StyleProp, View, ViewStyle } from "react-native"
import { PickerItemProps } from "react-native-ui-lib/typings"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "app/services/context"
import { translate } from "app/i18n"
import { SearchBar } from "../searchBar/SearchBar"


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
  const { colors } = useTheme()
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
        color: colors.title
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
        fontSize: 16,
        color: colors.secondaryText
      }}
      enableErrors={false}
      topBarProps={{
        title,
        titleStyle: {
          color: colors.title,
          fontSize: 24
        },
        containerStyle: {
          backgroundColor: colors.background,
          paddingVertical: 5
        },
        cancelLabel: translate('common.cancel'),
        cancelButtonProps: {
          labelStyle: {
            fontSize: 16,
            color: colors.secondaryText
          }
        },
        cancelIcon: null,
        doneLabel: translate('common.save'),
        doneButtonProps: {
          labelStyle: {
            fontSize: 16,
            color: colors.primary
          }
        },
        doneIcon: null
      }}
      listProps={{
        style: {
          backgroundColor: colors.background,
          marginBottom: insets.bottom
        }
      }}
      renderCustomSearch={({ onSearchChange }) => (
        <View style={{ paddingHorizontal: 20 }}>
          <SearchBar
            placeholder=".."
            onChangeText={onSearchChange}
          />
        </View>

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
            fontSize: 16,
            color: colors.title
          }}
          selectedIconColor={colors.primary}
          // @ts-ignore
          renderItem={renderItem}
        />
      ))}
    </Picker>
  )
}
