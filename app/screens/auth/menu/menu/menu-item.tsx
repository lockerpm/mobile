import React from "react"
import { Button, Text } from "../../../../components"
import { commonStyles, color } from "../../../../theme"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { observer } from "mobx-react-lite"

export type MenuItemProps = {
  icon: string,
  name: string,
  noCaret?: boolean,
  noBorder?: boolean,
  action?: Function
}

export const MenuItem = observer((props: MenuItemProps) => {
  return (
    <Button
      preset="link"
      onPress={() => props.action && props.action()}
      style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        paddingVertical: 16,
        borderBottomColor: color.line,
        borderBottomWidth: props.noBorder? 0 : 1
      }]}
    >
      <FontAwesomeIcon
        name={props.icon}
        size={18}
        color={color.textBlack}
        style={{
          width: 20
        }}
      />
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
  )
})
