import React from "react"
import { StyleSheet, View } from "react-native"

type ModalBackdropProps = {
  onPress: () => void
}

const transparent = "rgba(0, 0, 0, 0)"
export const ModalBackdrop = React.memo(({ onPress }: ModalBackdropProps) => {
  return (
    <View
      onTouchEnd={onPress}
      style={[StyleSheet.absoluteFillObject, { backgroundColor: transparent }]}
    />
  )
})
