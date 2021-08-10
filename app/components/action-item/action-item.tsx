import * as React from "react"
import { StyleProp, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { color } from "../../theme"
import { Text } from "../"
import { Actionsheet } from "native-base"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'


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
  children?: React.ReactNode
}

/**
 * Describe your component here
 */
export const ActionItem = observer(function ActionItem(props: ActionItemProps) {
  const { style, name, icon, textColor, action, children, iconColor } = props

  return (
    <Actionsheet.Item
      style={style}
      onPress={() => action && action()}
      endIcon={(
        <FontAwesomeIcon 
          name={icon}
          size={18} 
          color={iconColor || textColor || color.text}
        />
      )}
      _stack={{
        style: {
          flex: 1,
          justifyContent: 'space-between'
        }
      }}
    >
      {
        children || (
        <Text
          text={name}
          style={{ color: textColor || color.textBlack }}
        />
        )
      }
    </Actionsheet.Item>
  )
})
