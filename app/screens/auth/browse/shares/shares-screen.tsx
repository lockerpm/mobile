import React from "react"
import { View } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome"
import { Text, Button, Layout } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../services/mixins"
import { commonStyles } from "../../../../theme"

import BackIcon from "../../../../components/header/arrow-left.svg"
import BackIconLight from "../../../../components/header/arrow-left-light.svg"

import { observer } from "mobx-react-lite"
import { useStores } from "../../../../models"
import { SharingStatus } from "../../../../config/types"

export const SharesScreen = observer(() => {
  const navigation = useNavigation()
  const { translate, color, isDark } = useMixins()
  const { cipherStore } = useStores()

  const menu = [
    {
      path: "sharedItems",
      name: translate("shares.shared_items"),
      notiCount: cipherStore.sharingInvitations.length,
    },
    {
      path: "shareItems",
      name: translate("quick_shares.share_option.normal.tl"),
      notiCount: cipherStore.myShares.reduce((total, s) => {
        return total + s.members.filter((m) => m.status === SharingStatus.ACCEPTED).length
      }, 0),
    },
    {
      path: "quickShareItems",
      name: translate("quick_shares.share_option.quick.tl"),
      notiCount: cipherStore.myShares.reduce((total, s) => {
        return total + s.members.filter((m) => m.status === SharingStatus.ACCEPTED).length
      }, 0),
    },
  ]

  return (
    <Layout
      borderBottom
      hasBottomNav
      containerStyle={{
        backgroundColor: isDark ? color.background : color.block,
        paddingTop: 0,
      }}
      header={
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <Button
            preset="link"
            onPress={() => navigation.goBack()}
            style={{
              height: 35,
              width: 35,
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            {isDark ? <BackIconLight height={12} /> : <BackIcon height={12} />}
          </Button>

          <Text preset="largeHeader" text={translate("shares.shares")} />
        </View>
      }
    >
      <View
        style={{
          backgroundColor: isDark ? color.block : color.background,
          borderRadius: 10,
          paddingHorizontal: 14,
          marginTop: 20,
        }}
      >
        <ItemButton item={menu[0]} navigation={navigation} bottomBorder={false} />
      </View>
      <View
        style={{
          backgroundColor: isDark ? color.block : color.background,
          borderRadius: 10,
          paddingHorizontal: 16,
          marginTop: 20,
        }}
      >
        <Text text={translate("quick_shares.shared")} style={{
          marginTop: 12,
          fontSize: 14
        }}/>

        {menu.slice(1).map((item, index) => (
          <ItemButton key={index} item={item} navigation={navigation} bottomBorder={index === 0} />
        ))}
      </View>
    </Layout>
  )
})

interface Props {
  item: {
    path: string
    name: string
    notiCount: number
  }
  navigation: any
  bottomBorder: boolean
}

const ItemButton = ({ item, navigation, bottomBorder }: Props) => {
  const { color } = useMixins()
  return (
    <Button
      preset="link"
      onPress={() => {
        navigation.navigate(item.path)
      }}
      style={[
        commonStyles.CENTER_HORIZONTAL_VIEW,
        {
          borderBottomColor: color.line,
          borderBottomWidth: bottomBorder ? 1 : 0,
          paddingVertical: 18,
        },
      ]}
    >
      <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, { flex: 1 }]}>
        <Text text={item.name} style={{ color: color.title, marginRight: 12}}  />
        {item.notiCount > 0 && (
          <View
            style={{
              backgroundColor: color.error,
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
                color: color.white,
                lineHeight: 17,
              }}
            />
          </View>
        )}
      </View>
      <Icon name="angle-right" size={20} color={color.title} />
    </Button>
  )
}
