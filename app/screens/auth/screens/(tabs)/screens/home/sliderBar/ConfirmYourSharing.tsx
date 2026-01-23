import { StyleProp, View, ViewStyle, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"

import { Icon, PressableIcon, Text, PressableText } from "app/components/cores"

import { TabsScreenProps } from "@/navigators"
import { useAppTheme } from "@/utils/useAppTheme"

interface Props {
  onClose: () => void
  style: StyleProp<ViewStyle>
}

export const ConfirmYourSharing = observer(({ onClose, style }: Props) => {
  const navigation = useNavigation<TabsScreenProps<"homeTab">["navigation"]>()
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <View style={style}>
      <Icon icon="share-network" size={32} />
      <View style={styles.content}>
        <Text tx={"shares:confirm_share.noti_label"} size="xs" />
        <PressableText
          preset="bold"
          tx={"shares:confirm_share.noti_btn"}
          color={colors.link}
          style={styles.label}
          onPress={() => {
            navigation.navigate("browseStack", {
              screen: "shareStack",
              params: {
                screen: "yourShareCipherList",
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
