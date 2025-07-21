import { memo } from "react"
import { StyleSheet, View } from "react-native"

type ModalBackdropProps = {
  onPress: () => void
  backgroundColor?: string
}

const transparent = "rgba(0, 0, 0, 0)"
export const ModalBackdrop = memo(({ onPress, backgroundColor }: ModalBackdropProps) => {
  return (
    <View
      onTouchEnd={onPress}
      style={[StyleSheet.absoluteFillObject, { backgroundColor: backgroundColor ?? transparent }]}
    />
  )
})
ModalBackdrop.displayName = "ModalBackdrop"
