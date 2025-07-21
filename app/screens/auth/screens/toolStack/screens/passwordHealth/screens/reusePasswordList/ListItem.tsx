import { memo } from "react"
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native"
import { Icon, Text } from "app/components/cores"

import { getCipherDescription } from "app/utils/cipherHelper"
import { CipherIconImage } from "app/components/ciphers"
import { useAppTheme } from "@/utils/useAppTheme"
import { useAppLocale } from "@/i18n"
import { ThemedStyle } from "@/theme"
import { CipherAppView } from "@/static/types"

export type PasswordHealthView = CipherAppView & {
  count: number
}

type Prop = {
  item: PasswordHealthView
  goToDetail: (val: CipherAppView) => void
}

export const ListItem = memo((props: Prop) => {
  const { item, goToDetail } = props
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()
  const des = getCipherDescription(item)

  return (
    <TouchableOpacity onPress={() => goToDetail(item)} style={styles.container}>
      <View style={styles.row}>
        <CipherIconImage cipherType={item.type} source={item.imgLogo} style={styles.image} />

        <View style={styles.content}>
          <View style={styles.row}>
            <Text preset="bold" text={item.name} numberOfLines={1} style={styles.text} />

            {item.organizationId && (
              <View style={styles.icon}>
                <Icon icon="users-three" size={22} />
              </View>
            )}

            <View style={themed($containerTime)}>
              <Text
                preset="bold"
                size="xs"
                text={`${item.count} ${translate("common:times")}`}
                color={colors.white}
              />
            </View>
          </View>

          {!!des && <Text preset="label" text={des} size="sm" numberOfLines={1} />}
        </View>
      </View>
    </TouchableOpacity>
  )
})

ListItem.displayName = "ReusePasswordListItem"

const $containerTime: ThemedStyle<ViewStyle> = ({ colors }) => ({
  paddingHorizontal: 10,
  paddingVertical: 2,
  backgroundColor: colors.warning,
  borderRadius: 3,
  marginLeft: 7,
})
const styles = StyleSheet.create({
  container: {
    height: 71,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  icon: {
    marginLeft: 12,
  },
  image: {
    borderRadius: 8,
    height: 40,
    width: 40,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  text: {
    flexGrow: 1,
    flexShrink: 1,
  },
})
