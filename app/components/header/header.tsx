import * as React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { Text, Button, AutoImage as Image } from "../"
import { flatten } from "ramda"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { color } from "../../theme"

const CONTAINER: ViewStyle = {
  flexDirection: 'row',
  justifyContent: "space-between",
  alignItems: 'center'
}

export interface HeaderProps {
  children?: React.ReactNode,
  style?: StyleProp<ViewStyle>,
  title?: string,
  left?: JSX.Element,
  right?: JSX.Element,
  goBack?: Function,
  goBackText?: string,
  showLogo?: boolean
}

/**
 * Describe your component here
 */
export const Header = observer(function Header(props: HeaderProps) {
  const { style } = props
  const styles = flatten([CONTAINER, style])

  return (
    <View> 
      <View style={styles}>
        {
          props.left 
            ? props.left 
            : props.goBack ? (
              <Button preset="link" onPress={() => props.goBack()}>
                {
                  props.goBackText ? (
                    <Text
                      text={props.goBackText}
                      style={{ fontSize: 12 }}
                    />
                  ) : (
                    <IoniconsIcon 
                      name="md-arrow-back"
                      size={20} 
                      color={color.title} 
                    />
                  )
                }
              </Button>
            ) : props.showLogo && (
              <Image source={require('./locker-logo.png')} style={{ height: 24 }} />
            )
        }
        {
          props.title && (
          <Text preset="semibold">
            {props.title}
          </Text>
          )
        }
        {
          props.right && props.right
        }
      </View>

      {props.children}
    </View>
  )
})
