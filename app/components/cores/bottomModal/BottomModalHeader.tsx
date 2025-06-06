import React from "react"
import { View, StyleSheet } from "react-native"
import { Text } from "../text/Text"
import { Icon } from "../icon/Icon"

interface Props {
  title: string
  onClose: () => void
}

export const BottomModalHeader = ({ title, onClose }: Props) => {
  return (
    <View style={styles.header}>
      <Text preset="bold" text={title} size="large" style={styles.title} />
      <Icon icon="x" onPress={onClose} />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: 45,
    justifyContent: "space-between",
  },
  title: {
    flexGrow: 1,
    flexShrink: 1,
  },
})
