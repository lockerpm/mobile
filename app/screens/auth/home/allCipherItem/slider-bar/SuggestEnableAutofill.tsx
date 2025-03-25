import React from "react"
import { StyleProp, View, ViewStyle, StyleSheet } from "react-native"
import { useTheme } from "app/services/context"
import { useNavigation } from "@react-navigation/native"
import { Icon, Text, TouchableText } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { useHelper } from "app/services/hook"

interface Props {
  onClose: () => void
  style: StyleProp<ViewStyle>
}

export const SuggestEnableAutofill = observer(({ onClose, style }: Props) => {
  const navigation = useNavigation() as any
  const { translate } = useHelper()
  const { colors } = useTheme()
  return (
    <View style={style}>
      <Icon icon="keyboard" size={32} />
      <View style={styles.content}>
        <Text text={translate("all_items.enable_autofill.content")} />
        <TouchableText
          preset="bold"
          text={translate("all_items.enable_autofill.btn")}
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
})

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
