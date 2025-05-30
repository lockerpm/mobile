import { BlurView } from "@react-native-community/blur"
import { useTheme } from "app/services/context"
import React from "react"
import { StyleSheet } from "react-native"

type ModalBackdropProps = {
  onPress: () => void
}

const transparent = "rgba(0, 0, 0, 0)"
export const ModalBackdrop = React.memo(({ onPress }: ModalBackdropProps) => {
  const { isDark } = useTheme()
  return (
    <BlurView
      onTouchEnd={onPress}
      blurType={isDark ? "light" : "dark"}
      blurAmount={0}
      blurRadius={10}
      overlayColor="rgba(0,0,0,0.1)"
      style={[StyleSheet.absoluteFillObject, { backgroundColor: transparent }]}
    />
  )
})
