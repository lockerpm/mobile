import * as React from 'react'
import { StyleProp, TextInput, TextInputProps, View, ViewStyle } from 'react-native'
import { SharedValue } from 'react-native-reanimated'
import { Text, Icon } from '../../cores'
import { useTheme } from 'app/services/context'

export interface SearchBarProps extends TextInputProps {
  /**
   * Handle scroll to hide search bar
   */
  scrollY?: SharedValue<number>
  /**
   * override default style
   */
  containerStyle?: StyleProp<ViewStyle>
  /**
   * search title
   */
  label?: string
}

export const SearchBar = (props: SearchBarProps) => {
  const { containerStyle, label, ...textInputProps } = props
  const { colors } = useTheme()

  const CONTAINER: StyleProp<ViewStyle> = [
    {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.palette.neutral4,
      borderRadius: 8,
      paddingLeft: 16,
      paddingRight: 8,
    },
    containerStyle,
  ]

  return (
    <View style={CONTAINER}>
      {!label && (
        <Icon
          testID="searchBar.icon"
          icon="magnifying-glass"
          size={16}
          color={colors.primaryText}
        />
      )}
      <Text text={label} color={colors.primaryText} />
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
        {...textInputProps}
      />
    </View>
  )
}
