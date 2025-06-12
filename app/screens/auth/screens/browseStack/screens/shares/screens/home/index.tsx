import React, { FC } from "react"
import { TouchableOpacity, View } from "react-native"
import { observer } from "mobx-react-lite"
import { useTheme } from "app/services/context"
import { useStores } from "app/models"
import { SharingStatus } from "app/static/types"
import { Header, Icon, Screen, Text } from "app/components/cores"
import { MenuItemContainer } from "app/components/utils"
import { ShareStackScreenProps } from "app/navigators"
import { TxKeyPath } from "app/i18n"

type ItemType = {
  onPress: () => void
  tx: TxKeyPath
  notiCount: number
}

export const SharesHomeScreen: FC<ShareStackScreenProps<"sharesHome">> = observer(
  ({ navigation }) => {
    const { cipherStore } = useStores()
    const { colors } = useTheme()

    const menu: ItemType[] = [
      {
        onPress: () => {
          navigation.navigate("sharedItems")
        },
        tx: "shares.shared_items",
        notiCount: cipherStore.sharingInvitationsIgnoreAccept.length,
      },
      {
        onPress: () => {
          navigation.navigate("shareItems")
        },
        tx: "quick_shares.share_option.normal.tl",
        notiCount: cipherStore.myShares.reduce((total, s) => {
          return total + s.members.filter((m) => m.status === SharingStatus.ACCEPTED).length
        }, 0),
      },
      {
        onPress: () => {
          navigation.navigate("quickShareItems")
        },
        tx: "quick_shares.share_option.quick.tl",
        notiCount: 0,
      },
    ]

    return (
      <Screen
        padding
        preset="auto"
        header={
          <Header leftIcon="arrow-left" onLeftPress={navigation.goBack} titleTx="shares.shares" />
        }
        backgroundColor={colors.block}
      >
        <MenuItemContainer>
          <ItemButton item={menu[0]} />
        </MenuItemContainer>

        <MenuItemContainer titleTx="quick_shares.shared">
          {menu.slice(1).map((item, index) => (
            <ItemButton key={index} item={item} />
          ))}
        </MenuItemContainer>
      </Screen>
    )
  },
)

interface Props {
  item: ItemType
}

const ItemButton = ({ item }: Props) => {
  const { colors } = useTheme()
  return (
    <TouchableOpacity
      onPress={item.onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
      }}
    >
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
        <Text tx={item.tx} style={{ color: colors.title, marginRight: 12 }} />
        {item.notiCount > 0 && (
          <View
            style={{
              backgroundColor: colors.error,
              borderRadius: 20,
              minWidth: 17,
              height: 17,
            }}
          >
            <Text
              text={item.notiCount >= 100 ? "99+" : item.notiCount.toString()}
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
      <Icon icon="caret-right" size={20} color={colors.secondaryText} />
    </TouchableOpacity>
  )
}
