import { observer } from 'mobx-react-lite'
import React from 'react'
import { StyleProp, ViewStyle, View } from 'react-native'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { Button, Text } from '../../../../components'
import { useStores } from '../../../../models'
import { commonStyles, color as colorLight, colorDark } from '../../../../theme'

export type SettingsItemProps = {
  style?: StyleProp<ViewStyle>
  name: string
  right?: JSX.Element
  noCaret?: boolean
  color?: string
  action?: Function
  noBorder?: boolean
  disabled?: boolean
}

export const SettingsItem = observer((props: SettingsItemProps) => {
  const { uiStore } = useStores()
  const color = uiStore.isDark ? colorDark : colorLight

  return props.action ? (
    <Button
      isDisabled={props.disabled}
      preset="link"
      onPress={() => props.action()}
      style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        borderBottomColor: color.line,
        borderBottomWidth: props.noBorder ? 0 : 1,
        justifyContent: 'space-between',
        paddingVertical: 16
      }, props.style]}
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
  ) : (
    <View
      style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        borderBottomColor: color.line,
        borderBottomWidth: props.noBorder ? 0 : 1,
        justifyContent: 'space-between',
        paddingVertical: 16
      }, props.style]}
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
    </View>
  )
})
