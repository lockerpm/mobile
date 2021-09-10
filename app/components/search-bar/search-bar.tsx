import * as React from "react"
import { StyleProp, TextInput, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color, fontSize } from "../../theme"
import { flatten } from "ramda"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { translate } from "../../i18n"

const CONTAINER: ViewStyle = {
  flexDirection: "row", 
  alignItems: "center",
  backgroundColor: color.block,
  borderRadius: 5,
  borderWidth: 1,
  borderColor: color.line
}

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
  const styles = flatten([CONTAINER, style])

  return (
    <View style={styles}>
      <TextInput
        value={value}
        placeholder={translate('common.search')}
        onChangeText={(txt) => onSearch && onSearch(txt)}
        clearButtonMode="while-editing"
        style={{
          flex: 1,
          paddingVertical: 5,
          paddingHorizontal: 10,
          fontSize: fontSize.p,
          color: color.textBlack
        }}
      />
      <FontAwesomeIcon
        name="search"
        size={14}
        color={color.text}
        style={{
          paddingHorizontal: 10
        }}
      />
    </View>
  )
})
