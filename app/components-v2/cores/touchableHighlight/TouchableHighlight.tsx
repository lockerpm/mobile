import { useTheme } from 'app/services/context'
import React from 'react'

import { TouchableHighlight as RNTouchableHignlight, TouchableHighlightProps } from 'react-native'

export const TouchableHighlight = (
  props: TouchableHighlightProps & { children?: React.ReactElement }
) => {
  const { colors } = useTheme()
  return (
    <RNTouchableHignlight underlayColor={colors.palette.neutral4} {...props}></RNTouchableHignlight>
  )
}
