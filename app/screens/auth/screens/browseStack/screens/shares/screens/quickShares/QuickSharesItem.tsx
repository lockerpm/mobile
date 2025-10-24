import { memo } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import moment from "moment"
import { SendView } from "core/models/view/sendView"
import { PressableScale, Text } from "app/components/cores"
import { CipherIconImage } from "app/components/ciphers/cipherList/CipherIconImage"
import { useAppTheme } from "@/utils/useAppTheme"
import { getCipherLogo } from "@/utils/cipherHelper"
import { ThemedStyle } from "@/theme"

type Prop = {
  item: SendView
  openActionMenu: (val: SendView) => void
}

export const QuickSharesItem = memo((props: Prop) => {
  const { openActionMenu, item } = props
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const cipherLogo = getCipherLogo(item.cipher)

  const cipher = {
    ...item.cipher,
    imgLogo: cipherLogo,
  }
  const description = moment.unix(item.creationDate.getTime() / 1000).fromNow()

  const isExpired = item.expirationDate?.getTime() < Date.now()

  return (
    <PressableScale
      onPress={() => {
        openActionMenu(item)
      }}
      // eslint-disable-next-line react-native/no-inline-styles
      style={[styles.container, { opacity: isExpired ? 0.7 : 1 }]}
    >
      <CipherIconImage
        isHaveKey={cipher.login.hasFido2Credentials}
        source={cipher.imgLogo}
        style={styles.image}
        cipherType={cipher.type}
      />

      <View style={styles.row}>
        <View style={styles.content}>
          <Text preset="bold" numberOfLines={1} text={cipher.name} />
          <Text
            size="sm"
            tx="quick_shares:shared_begin"
            txOptions={{ time: description }}
            numberOfLines={1}
          />
        </View>
      </View>
      {isExpired && (
        <View style={themed($warning)}>
          <Text tx="common:expired" color={colors.background} size="xs" />
        </View>
      )}
    </PressableScale>
  )
})

QuickSharesItem.displayName = "QuickSharesItem"

const $warning: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.warning,
  paddingHorizontal: 10,
  paddingVertical: 2,
  borderRadius: 4,
})
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    height: 71,
    paddingVertical: 12,
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    marginHorizontal: 12,
  },
  image: {
    borderRadius: 8,
    height: 40,
    width: 40,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
  },
})
