import * as React from "react"
import { StyleProp, TextInput, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color as colorLight, colorDark, fontSize } from "../../theme"
import { flatten } from "ramda"
import { useMixins } from "../../services/mixins"
import { useStores } from "../../models"

// @ts-ignore
import SearchIcon from './search.svg'
// @ts-ignore
import SearchIconLight from './search-light.svg'

export interface SearchBarProps {
  style?: StyleProp<ViewStyle>
  onSearch?: (text: string) => void
  value?: string
}

/**
 * Describe your component here
 */
export const SearchBar = observer(function SearchBar(props: SearchBarProps) {
  const { style, onSearch, value } = props
  const { translate } = useMixins()
  const { uiStore } = useStores()
  const color = uiStore.isDark ? colorDark : colorLight

  const CONTAINER: ViewStyle = {
    flexDirection: "row", 
    alignItems: "center",
    backgroundColor: color.block,
    borderRadius: 5,
  }
  const styles = flatten([CONTAINER, style])

  return (
    <View style={styles}>
      <TextInput
        value={value}
        placeholder={translate('common.search')}
        placeholderTextColor={color.text}
        onChangeText={(txt) => onSearch && onSearch(txt)}
        clearButtonMode="while-editing"
        style={{
          flex: 1,
          paddingVertical: 10,
          paddingHorizontal: 10,
          fontSize: fontSize.p,
          color: color.textBlack
        }}
      />
      <View style={{ paddingHorizontal: 10 }}>
        {
          uiStore.isDark ? (
            <SearchIconLight height={16} />
          ) : (
            <SearchIcon height={16} />
          )
        }
      </View>
    </View>
  )
})
