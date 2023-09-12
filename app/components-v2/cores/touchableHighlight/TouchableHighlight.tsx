import { useTheme } from 'app/services/hook'
import React from 'react'


import { TouchableHighlight as RNTouchableHignlight, TouchableHighlightProps } from 'react-native'

export const TouchableHighlight = (props: TouchableHighlightProps) => {
  const {colors} = useTheme()
  return (
    <RNTouchableHignlight underlayColor={colors.palette.neutral4} {...props}>

    </RNTouchableHignlight>
  )
}