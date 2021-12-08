import React from "react"
import { View } from "react-native"
import { Button, Text } from "../../../../components"
import { commonStyles, color as colorLight, colorDark } from "../../../../theme"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { observer } from "mobx-react-lite"
import { useStores } from "../../../../models"

export type MenuItemProps = {
  icon: React.ReactNode,
  name: string,
  noCaret?: boolean,
  noBorder?: boolean,
  action?: Function
  disabled?: boolean
  debug?: boolean
}

export const MenuItem = observer((props: MenuItemProps) => {
  const { uiStore } = useStores()
  const color = uiStore.isDark ? colorDark : colorLight

  return !props.debug || __DEV__ ? (
    <Button
      isDisabled={props.disabled}
      preset="link"
      onPress={() => props.action && props.action()}
      style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        paddingVertical: 16,
        borderBottomColor: color.line,
        borderBottomWidth: props.noBorder ? 0 : 1,
      }]}
    >
      <View style={{ width: 25 }}>
        {props.icon}
      </View>
      <Text
        preset="black"
        text={props.name}
        style={{ flex: 1, paddingHorizontal: 10 }}
      />
      {
        !props.noCaret && (
          <FontAwesomeIcon
            name="angle-right"
            size={18}
            color={color.textBlack}
          />
        )
      }
    </Button>
  ) : null
})
