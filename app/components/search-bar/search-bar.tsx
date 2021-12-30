import React, { useState, useEffect } from "react"
import { StyleProp, TextInput, View, ViewStyle } from "react-native"
import { fontSize } from "../../theme"
import { flatten } from "ramda"
import { useMixins } from "../../services/mixins"

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
export const SearchBar = function SearchBar(props: SearchBarProps) {
  const { style, onSearch, value } = props
  const { translate, color, isDark } = useMixins()

  const [text, setText] = useState('')

  const CONTAINER: ViewStyle = {
    flexDirection: "row", 
    alignItems: "center",
    backgroundColor: color.block,
    borderRadius: 5,
  }
  const styles = flatten([CONTAINER, style])

  useEffect(() => {
    setText(value)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(text), 200)
    return () => {
      clearTimeout(timeout)
    }
  }, [text])

  return (
    <View style={styles}>
      <TextInput
        value={text}
        placeholder={translate('common.search')}
        placeholderTextColor={color.text}
        onChangeText={setText}
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
          isDark ? (
            <SearchIconLight height={16} />
          ) : (
            <SearchIcon height={16} />
          )
        }
      </View>
    </View>
  )
}
