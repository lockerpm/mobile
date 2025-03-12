import React from "react"
import { StyleProp, View, ViewStyle, StyleSheet } from "react-native"
import { useTheme } from "app/services/context"
import { useNavigation } from "@react-navigation/native"
import { Icon, Text } from "app/components/cores"

interface Props {
  onClose: () => void
  style: StyleProp<ViewStyle>
}

export const SuggestEnableAutofill = ({ onClose, style }: Props) => {
  const navigation = useNavigation() as any
  const { colors } = useTheme()
  return (
    <View style={style}>
      <Icon icon="keyboard" size={32} />
      <View style={styles.content}>
        <Text tx={"all_items.enable_autofill.content"} />
        <Text
          preset="bold"
          tx={"all_items.enable_autofill.btn"}
          color={colors.link}
          style={styles.label}
          onPress={() => {
            navigation.navigate("autofillService")
          }}
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
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    marginHorizontal: 8,
  },
  label: {
    marginTop: 10,
  },
})
