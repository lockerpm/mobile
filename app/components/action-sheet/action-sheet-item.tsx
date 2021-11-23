import * as React from "react"
import { StyleProp, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { flatten } from "ramda"
import { color as colorLight, colorDark } from "../../theme"
import { Button } from "../button/button"
import { useStores } from "../../models"


export interface ActionSheetItemProps {
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
  isOpen?: boolean
  onPress?: () => void
  disabled?: boolean,
  border?: boolean
}

/**
 * Describe your component here
 */
export const ActionSheetItem = observer(function ActionSheetItem(props: ActionSheetItemProps) {
  const { style, children, onPress, disabled, border } = props
  const { uiStore } = useStores()
  const color = uiStore.isDark ? colorDark : colorLight

  const CONTAINER: ViewStyle = {
    borderBottomColor: color.line, 
    width: '100%',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10
  }
  const styles = flatten([CONTAINER, style, {
    borderBottomWidth: border ? 1 : 0
  }])

  return (
    <Button
      preset="link"
      isDisabled={disabled}
      onPress={onPress}
      style={styles}
    >
      {children}
    </Button>
  )
})
