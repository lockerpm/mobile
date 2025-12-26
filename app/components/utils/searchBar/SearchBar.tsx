/* eslint-disable no-restricted-imports */
import { Platform, StyleProp, TextInput, TextInputProps, View, ViewStyle } from "react-native"

import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

import { Icon, PressableIcon } from "../../cores"

export interface SearchBarProps extends TextInputProps {
  /**
   * override default style
   */
  containerStyle?: StyleProp<ViewStyle>
}

export const SearchBar = (props: SearchBarProps) => {
  const { containerStyle, value, onChangeText, ...textInputProps } = props
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

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
      <Icon testID="searchBar.icon" icon="magnifying-glass" size={20} color={colors.label} />
      <TextInput
        testID="searchBar.textInput"
        selectionColor={colors.primary}
        placeholderTextColor={colors.text}
        clearButtonMode="while-editing"
        style={themed($input)}
        value={value}
        onChangeText={onChangeText}
        {...textInputProps}
      />
      {!!value && Platform.OS !== "ios" && (
        <PressableIcon
          icon="x-circle-fill"
          size={20}
          color={colors.label}
          onPress={() => {
            if (onChangeText) {
              onChangeText("")
            }
          }}
        />
      )}
    </View>
  )
}

const $input: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  paddingVertical: 10,
  paddingHorizontal: 8,
  fontSize: 16,
  color: colors.text,
})
