import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { PressableScale, Icon, Text } from "app/components/cores"
import { TxKeyPath } from "app/i18n"
import { memo } from "react"
import { ImageSourcePropType, Image, View, StyleSheet, ViewStyle } from "react-native"

export type BrowseData = {
  notiCount?: number
  total: number
  label: TxKeyPath
  onPress: () => void
  image: ImageSourcePropType
}

type Props = {
  item: BrowseData
}
export const BrowserItem = memo(({ item }: Props) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <PressableScale onPress={item.onPress} style={styles.container}>
      <Image resizeMode="contain" source={item.image} style={styles.image} />
      <View style={styles.content}>
        <Text tx={item.label} />

        {!!item.notiCount && item.notiCount > 0 && (
          <View style={themed($noti)}>
            <Text
              text={item.notiCount.toString()}
              color={colors.white}
              size="xxs"
              style={styles.centerText}
            />
          </View>
        )}
      </View>
      {item.total > 0 && <Text preset="label" text={item.total.toString()} style={styles.total} />}

      <Icon icon="caret-right" size={20} color={colors.label} />
    </PressableScale>
  )
})
BrowserItem.displayName = "BrowserItem"

const $noti: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.error,
  borderRadius: 20,
  minWidth: 17,
  marginLeft: 10,
  height: 17,
  justifyContent: "center",
  alignItems: "center",
})
const styles = StyleSheet.create({
  centerText: {
    textAlign: "center",
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
    paddingHorizontal: 10,
  },
  image: {
    borderRadius: 8,
    height: 40,
    width: 40,
  },
  total: {
    marginRight: 12,
  },
})
