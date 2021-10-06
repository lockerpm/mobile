import * as React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { Button } from "../button/button"
import { Text } from "../text/text"
import { AutoImage as Image } from "../auto-image/auto-image"
import { flatten } from "ramda"
import { fontSize } from "../../theme"


const CONTAINER: ViewStyle = {
  alignItems: 'center',
  marginTop: '10%'
}


export interface BrowseItemEmptyContentProps {
  style?: StyleProp<ViewStyle>
  img: any,
  title: string,
  desc: string,
  buttonText?: string,
  addItem?: Function
}

/**
 * Describe your component here
 */
export const BrowseItemEmptyContent = observer(function BrowseItemEmptyContent(props: BrowseItemEmptyContentProps) {
  const { style, img, title, desc, buttonText, addItem } = props
  const styles = flatten([CONTAINER, style])

  return (
    <View style={styles}>
      <Image source={img} />

      <Text
        preset="semibold"
        style={{ fontSize: fontSize.h4, marginBottom: 8, marginTop: 10, textAlign: 'center' }}
        text={title}
      />

      <Text 
        text={desc}
        style={{ textAlign: 'center', fontSize: fontSize.small, lineHeight: 21 }}
      />

      {
        (buttonText || addItem) && (
          <Button
            text={buttonText}
            onPress={() => addItem && addItem()}
            style={{
              marginTop: 26,
              paddingHorizontal: 42
            }}
          />
        )
      }
    </View>
  )
})
