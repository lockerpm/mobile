import React from 'react'
import { View, Image } from 'react-native'
import { Text } from 'app/components-v2/cores'

interface StepProps {
  text: string
  img: any
}

export const Step = (props: StepProps) => {
  return (
    <View
      style={{
        paddingVertical: 8,
        flexDirection: 'row',
      }}
    >
      <Image source={props.img} style={{ width: 24, height: 24 }} />
      <Text
        text={props.text}
        style={{
          alignSelf: 'center',
          marginLeft: 16,
          fontSize: 16,
        }}
      />
    </View>
  )
}
