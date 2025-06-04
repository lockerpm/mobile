import * as React from "react"
import { StyleProp, TextInput, TextInputProps, View, ViewStyle } from "react-native"
import { Icon } from "../../cores"
import { useTheme } from "app/services/context"
import { IS_IOS } from "app/config/constants"

export interface SearchBarProps extends TextInputProps {
  /**
   * override default style
   */
  containerStyle?: StyleProp<ViewStyle>
}

export const SearchBar = (props: SearchBarProps) => {
  const { containerStyle, value, onChangeText, ...textInputProps } = props
  const { colors } = useTheme()

  const CONTAINER: StyleProp<ViewStyle> = [
    {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.block,
      borderRadius: 8,
      paddingLeft: 16,
      paddingRight: 8,
    },
    containerStyle,
  ]

  return (
    <View style={CONTAINER}>
      <Icon
        testID="searchBar.icon"
        icon="magnifying-glass"
        size={20}
        color={colors.secondaryText}
      />
      <TextInput
        testID="searchBar.textInput"
        selectionColor={colors.primary}
        placeholderTextColor={colors.primaryText}
        clearButtonMode="while-editing"
        style={{
          flex: 1,
          paddingVertical: 10,
          paddingHorizontal: 8,
          fontSize: 16,
          color: colors.primaryText,
        }}
        value={value}
        onChangeText={onChangeText}
        {...textInputProps}
      />
      {!!value && !IS_IOS && (
        <Icon
          filled
          icon="x-circle"
          size={20}
          color={colors.secondaryText}
          onPress={() => {
            onChangeText && onChangeText("")
          }}
        />
      )}
    </View>
  )
}
