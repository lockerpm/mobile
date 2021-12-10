import * as React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { commonStyles } from "../../../theme"
import { Text } from "../../text/text"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { ActionSheetItem } from "../../action-sheet/action-sheet-item"
import { useMixins } from "../../../services/mixins"


export interface ActionItemProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  name?: string
  icon?: string,
  iconColor?: string,
  textColor?: string
  action?: Function,
  children?: React.ReactNode,
  disabled?: boolean
}

/**
 * Describe your component here
 */
export const ActionItem = function ActionItem(props: ActionItemProps) {
  const { style, name, icon, textColor, action, children, iconColor, disabled } = props
  const { color } = useMixins()

  return (
    <ActionSheetItem
      disabled={disabled}
      style={[{
        paddingVertical: 12
      }, style]}
      onPress={() => action && action()}
    >
      <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        justifyContent: 'space-between',
        width: '100%'
      }]}>
        {
          children || (
          <Text
            text={name}
            style={{ color: textColor || color.textBlack }}
          />
          )
        }
        {
          !!icon && (
            <FontAwesomeIcon 
              name={icon}
              size={16} 
              color={iconColor || textColor || color.text}
            />
          )
        }
      </View>
    </ActionSheetItem>
  )
}
