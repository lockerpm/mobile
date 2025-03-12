import { useTheme } from "app/services/context"
import React from "react"
import { View, StyleProp, ViewStyle, StyleSheet } from "react-native"
import { Icon, Text } from "app/components/cores"

interface Props {
  onClose: () => void
  style: StyleProp<ViewStyle>
}

export const FirstImport = ({ onClose, style }: Props) => {
  const { colors } = useTheme()

  const onPress = () => {
    //
  }

  return (
    <View style={style}>
      <Icon icon="keyboard" size={32} />

      <View style={styles.content}>
        <Text tx="biometric_intro.suggest" />
        <Text
          preset="bold"
          tx="common.enable"
          color={colors.link}
          style={styles.label}
          onPress={onPress}
        />
      </View>
      <Icon icon="x" size={20} onPress={onClose} containerStyle={styles.close} />
    </View>
  )
}

const styles = StyleSheet.create({
  close: {
    alignItems: "center",
    height: 32,
    justifyContent: "flex-start",
    width: 32,
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    marginHorizontal: 8,
  },
  label: {
    marginTop: 10,
  },
})
