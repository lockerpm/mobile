import * as React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { Text, Button, AutoImage as Image } from ".."
import { flatten } from "ramda"


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
        style={{ fontSize: 16, marginBottom: 8, marginTop: 10 }}
        text={title}
      />

      <Text 
        text={desc}
        style={{ textAlign: 'center', fontSize: 12 }}
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
