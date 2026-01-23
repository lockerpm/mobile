import { FC } from "react"
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native"
import { useAtomValue } from "jotai"
import { observer } from "mobx-react-lite"

import { Header, Icon, Screen, Text } from "app/components/cores"
import { MenuItemContainer } from "app/components/utils"
import { TxKeyPath } from "app/i18n"
import { useStores } from "app/models"
import { ShareScreenProps } from "app/navigators"

import { confirmShareAtom } from "@/services/utils/useConfirmShare"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

type ItemType = {
  onPress: () => void
  tx: TxKeyPath
  notiCount: number
}

export const SharesHomeScreen: FC<ShareScreenProps<"sharesHome">> = observer(({ navigation }) => {
  const { cipherStore } = useStores()
  const {
    theme: { colors },
  } = useAppTheme()
  const confirmShareCount = useAtomValue(confirmShareAtom)

  const menu: ItemType[] = [
    {
      onPress: () => {
        navigation.navigate("sharedWithYouCipherList")
      },
      tx: "shares:shared_items",
      notiCount: cipherStore.sharingInvitationsIgnoreAccept.length,
    },
    {
      onPress: () => {
        navigation.navigate("yourShareCipherList")
      },
      tx: "quick_shares:share_option.normal.tl",
      notiCount: confirmShareCount,
    },
    {
      onPress: () => {
        navigation.navigate("quickShareCipherList")
      },
      tx: "quick_shares:share_option.quick.tl",
      notiCount: 0,
    },
  ]

  return (
    <Screen
      preset="auto"
      header={
        <Header leftIcon="arrow-left" onLeftPress={navigation.goBack} titleTx="shares:shares" />
      }
      backgroundColor={colors.block}
      contentContainerStyle={styles.ph16}
    >
      <MenuItemContainer>
        <ItemButton item={menu[0]} />
      </MenuItemContainer>

      <MenuItemContainer titleTx="quick_shares:shared">
        {menu.slice(1).map((item, index) => (
          <ItemButton key={index} item={item} />
        ))}
      </MenuItemContainer>
    </Screen>
  )
})

interface Props {
  item: ItemType
}

const ItemButton = ({ item }: Props) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  return (
    <TouchableOpacity onPress={item.onPress} style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Text tx={item.tx} style={styles.itemText} />
        {item.notiCount > 0 && (
          <View style={themed($noti)}>
            <Text
              text={item.notiCount >= 100 ? "99+" : item.notiCount.toString()}
              size="xxs"
              color={colors.white}
              style={styles.centerText}
            />
          </View>
        )}
      </View>
      <Icon icon="caret-right" size={20} color={colors.label} />
    </TouchableOpacity>
  )
}

const $noti: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.error,
  borderRadius: 20,
  minWidth: 17,
  height: 17,
  marginRight: 12,
  justifyContent: "center",
  alignItems: "center",
})

const styles = StyleSheet.create({
  centerText: {
    textAlign: "center",
  },
  itemContainer: {
    alignItems: "center",
    flexDirection: "row",
    padding: 16,
  },
  itemContent: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
  },
  itemText: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  ph16: {
    paddingHorizontal: 16,
  },
})
