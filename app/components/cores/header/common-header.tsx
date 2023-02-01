import React from 'react'
import { ColorValue } from 'react-native'
import { Header } from '..'

interface Props {
  navigation: any
  iconColor?: ColorValue
}

export const GoBackHeader = (props: Props) => (
  <Header
    leftIcon={'arrow-left'}
    leftIconColor={props.iconColor}
    onLeftPress={() => {
      props.navigation.goBack()
    }}
  />
)
