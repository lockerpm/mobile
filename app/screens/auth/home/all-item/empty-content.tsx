import React from "react"
import { View } from "react-native"
import { Text, AutoImage as Image, Button } from "../../../../components"

interface Props {
  addItem?: Function
}

export const ItemEmptyContent = (props: Props) => {
  return (
    <View 
      style={{ alignItems: 'center', marginTop: '10%' }}
    >
      <Image source={require('./empty-img.png')} />

      <Text
        preset="semibold"
        style={{ fontSize: 16, marginBottom: 8, marginTop: 10 }}
        text="Add your first item"
      />

      <Text 
        text="Create your first item to start building your vault"
        style={{ textAlign: 'center', fontSize: 12 }}
      />

      <Button
        text="Add Item"
        onPress={() => props.addItem && props.addItem()}
        style={{
          marginTop: 26,
          paddingHorizontal: 42
        }}
      />
    </View>
  )
}