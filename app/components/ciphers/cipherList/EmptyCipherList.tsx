import * as React from 'react'
import { StyleProp, View, ViewStyle, ImageStyle, ImageSourcePropType, Image } from 'react-native'
import { Button, Text } from '../../cores'

export interface EmptyCipherListProps {
  style?: StyleProp<ViewStyle>
  img: ImageSourcePropType
  imgStyle?: ImageStyle
  title: string
  desc: string
  buttonText?: string
  addItem?: () => void
}

export const EmptyCipherList = (props: EmptyCipherListProps) => {
  const { style, img, title, desc, buttonText, addItem, imgStyle } = props

  return (
    <View style={[{ alignItems: 'center', marginTop: '10%' }, style]}>
      <Image source={img} style={imgStyle} />

      <Text
        preset="bold"
        size="large"
        style={{ marginBottom: 8, marginTop: 10, textAlign: 'center' }}
        text={title}
      />

      <Text
        preset="label"
        text={desc}
        size="base"
        style={{ textAlign: 'center', lineHeight: 21 }}
      />

      {buttonText && addItem && (
        <Button
          text={buttonText}
          onPress={addItem}
          style={{
            marginTop: 26,
            paddingHorizontal: 42,
          }}
        />
      )}
    </View>
  )
}
