import { BottomModal, Icon, PressableScale, Text } from "@/components/cores"
import { CARD_BRANDS } from "@/static/constants"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { FlatList, View, ViewStyle, StyleSheet, Image } from "react-native"

type Props = {
  isOpen: boolean
  onClose: () => void
  brand: string
  setBrand: (val: string) => void
}

export const BrandsModal = ({ isOpen, onClose, brand, setBrand }: Props) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} tx={"card:brand"} contentContainer={$content}>
      <FlatList
        bounces={false}
        data={CARD_BRANDS}
        keyExtractor={(item) => item.label}
        renderItem={({ item }) => (
          <PressableScale onPress={() => setBrand(item.value)}>
            <View style={styles.item}>
              <Image source={item.logo} style={styles.logo} />
              <Text text={item.label} style={styles.label} />

              {brand === item.value && <Icon icon="check" size={24} color={colors.primary} />}
            </View>
          </PressableScale>
        )}
        ItemSeparatorComponent={() => <View style={themed($divider)} />}
        getItemLayout={(data, index) => ({
          length: 52.2,
          offset: 52.2 * index,
          index,
        })}
        contentContainerStyle={styles.contentContainer}
      />
    </BottomModal>
  )
}

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.border,
})

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
  },
  item: {
    alignItems: "center",
    flexDirection: "row",
    height: 52.2,
    paddingVertical: 15,
  },
  label: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  logo: {
    borderRadius: 8,
    height: 32,
    marginRight: 8,
    width: 32,
  },
})

const $content: ViewStyle = {
  padding: 0,
  maxHeight: "auto",
  paddingHorizontal: 0,
}
