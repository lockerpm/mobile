import * as React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { flatten } from "ramda"
import { fontSize } from "../../theme"
import { Button } from "../button/button"
import { Text } from "../text/text"
import { AutoImage as Image } from "../auto-image/auto-image"
import { APP_ICON } from "../../common/mappings"
import { useStores } from "../../models"

// @ts-ignore
import BackIcon from './arrow-left.svg'
// @ts-ignore
import BackIconLight from './arrow-left-light.svg'

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
  const { uiStore } = useStores()
  const styles = flatten([CONTAINER, style])

  return (
    <View> 
      <View style={styles}>
        {
          props.left 
            ? props.left 
            : props.goBack ? (
              <Button 
                preset="link" 
                onPress={() => props.goBack()}
                style={{ 
                  height: 35,
                  width: props.goBackText ? undefined : 35,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  marginLeft: -8,
                  paddingLeft: 8
                }}
              >
                {
                  props.goBackText ? (
                    <Text
                      text={props.goBackText}
                      style={{ fontSize: fontSize.p }}
                    />
                  ) : (
                    uiStore.isDark ? (
                      <BackIconLight height={12} />
                    ) : (
                      <BackIcon height={12} />
                    )
                  )
                }
              </Button>
            ) : props.showLogo && (
              <Image 
                source={uiStore.isDark ? APP_ICON.textHorizontalLight : APP_ICON.textHorizontal} 
                style={{ height: 30, width: 97.5 }} 
              />
            )
        }
        {
          props.title && (
          <Text preset="semibold" style={{ fontSize: fontSize.h5 }}>
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
