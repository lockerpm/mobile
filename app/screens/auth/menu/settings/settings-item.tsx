import { observer } from 'mobx-react-lite'
import React from 'react'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { Button, Text } from '../../../../components'
import { commonStyles, color } from '../../../../theme'

export type SettingsItemProps = {
  name: string,
  right?: JSX.Element,
  noCaret?: boolean,
  color?: string,
  action?: Function,
  noBorder?: boolean,
  noPadding?: boolean
}

export const SettingsItem = observer((props: SettingsItemProps) => {
  return (
    <Button
      preset="link"
      onPress={() => props.action && props.action()}
      style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        borderBottomColor: color.line,
        borderBottomWidth: props.noBorder ? 0 : 1,
        justifyContent: 'space-between',
        paddingVertical: props.noPadding ? 0 : 16
      }]}
    >
      <Text
        preset="black"
        text={props.name}
        style={{ color: props.color || color.textBlack }}
      />
      {
        props.right || !props.noCaret && (
          <FontAwesomeIcon
            name="angle-right"
            size={18}
            color={props.color || color.textBlack}
          />
        )
      }
      
    </Button>
  )
})
