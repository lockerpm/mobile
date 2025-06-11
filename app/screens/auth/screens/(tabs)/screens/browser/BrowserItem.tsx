import { PressableScale, Icon, Text } from "app/components/cores"
import { TxKeyPath } from "app/i18n"
import { useTheme } from "app/services/context"
import React from "react"
import { ImageSourcePropType, Image, View } from "react-native"

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
export const BrowserItem = React.memo(({ item }: Props) => {
  const { colors } = useTheme()

  return (
    <PressableScale
      onPress={item.onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
      }}
    >
      <Image resizeMode="contain" source={item.image} style={{ height: 40, width: 40 }} />
      <View style={{ flex: 1, paddingHorizontal: 10, flexDirection: "row", alignItems: "center" }}>
        <Text tx={item.label} style={{ marginRight: 10 }} />
        {!!item.notiCount && item.notiCount > 0 && (
          <View
            style={{
              backgroundColor: colors.error,
              borderRadius: 20,
              minWidth: 17,
              height: 17,
            }}
          >
            <Text
              text={item.notiCount.toString()}
              style={{
                fontSize: 12,
                textAlign: "center",
                color: colors.white,
                lineHeight: 17,
              }}
            />
          </View>
        )}
      </View>
      {item.total > 0 && (
        <Text preset="label" text={item.total.toString()} style={{ marginRight: 12 }} />
      )}

      <Icon icon="caret-right" size={20} color={colors.secondaryText} />
    </PressableScale>
  )
})
