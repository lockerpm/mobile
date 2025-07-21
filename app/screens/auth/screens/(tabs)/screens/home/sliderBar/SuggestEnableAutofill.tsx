import { StyleProp, View, ViewStyle, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Icon, PressableIcon, Text, PressableText } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { useAppTheme } from "@/utils/useAppTheme"
import { TabsScreenProps } from "@/navigators"

interface Props {
  onClose: () => void
  style: StyleProp<ViewStyle>
}

export const SuggestEnableAutofill = observer(({ onClose, style }: Props) => {
  const navigation = useNavigation<TabsScreenProps<"homeTab">["navigation"]>()
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <View style={style}>
      <Icon icon="keyboard" size={32} />
      <View style={styles.content}>
        <Text tx={"all_items:enable_autofill.content"} />
        <PressableText
          preset="bold"
          tx={"all_items:enable_autofill.btn"}
          color={colors.link}
          style={styles.label}
          onPress={() => {
            navigation.navigate("menuStack", {
              screen: "settingsStack",
              params: {
                screen: "autofillService",
              },
            })
          }}
        />
      </View>

      <PressableIcon icon="x" size={20} onPress={onClose} containerStyle={styles.close} />
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
