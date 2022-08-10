import React from 'react'
import { StyleProp, ViewStyle, View, ActivityIndicator, ColorValue, Switch, TextStyle } from 'react-native'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { Button, Text } from '../../../../components'
import { useMixins } from '../../../../services/mixins'
import { commonStyles, fontSize } from '../../../../theme'



type SettingsItemProps = {
  style?: StyleProp<ViewStyle>
  name: string
  right?: JSX.Element
  noCaret?: boolean
  color?: string
  action?: Function
  noBorder?: boolean
  disabled?: boolean
  isLoading?: boolean
}


export const SettingsItem = (props: SettingsItemProps) => {
  const { color } = useMixins()

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
        props.isLoading ? (
          <ActivityIndicator size="small" color={color.primary} />
        ) : props.right || !props.noCaret && (
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
}


interface SettingSwipeItemProps extends SettingsItemProps {
  value: boolean
  onValueChange: (val: boolean) => void
  trackColor?: {
    false: ColorValue,
    true: ColorValue
  }
  thumbColor?: ColorValue
}

export const SettingSwipeItem = (props: SettingSwipeItemProps) => {
  const { name, value, onValueChange, trackColor, thumbColor, ...others } = props
  const { color } = useMixins()

  return <SettingsItem
    name={name}
    {...others}
    right={(
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={trackColor ? trackColor : { false: color.disabled, true: color.primary }}
        thumbColor={thumbColor ? thumbColor : color.white}
      />
    )}
  />
}


interface WrapperProps {
  title?: string
  children: React.ReactNode,
}


export const SectionWrapperItem = (props: WrapperProps) => {
  const { title, children } = props
  const { color } = useMixins()

  const SECTION_TITLE: TextStyle = {
    fontSize: fontSize.p,
    marginHorizontal: 20,
    marginBottom: 12,
  }

  return (
    <View>
      {
        title && <Text
          text={title}
          style={SECTION_TITLE}
        />
      }
      <View style={[commonStyles.GRAY_SCREEN_SECTION, {
        backgroundColor: color.background,
      }]}>
        {children}
      </View>
    </View>
  )
}