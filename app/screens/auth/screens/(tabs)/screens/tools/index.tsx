import { FC, useCallback } from "react"
import { View, StyleSheet, ViewStyle } from "react-native"
import { getLocales } from "expo-localization"

import { Text, Screen, Icon, ImageIcon, ImageIconTypes, PressableScale } from "app/components/cores"
import { TabHeader } from "app/components/cores/header/TabHeader"
import { PremiumTag } from "app/components/utils"
import { TxKeyPath } from "app/i18n"
import { useStores } from "app/models"
import { TabsScreenProps, ToolsRoute } from "app/navigators"

import { useAppTheme } from "@/utils/useAppTheme"

const isVietnam = () => {
  const locales = getLocales()
  let isVietnam = false
  if (locales.length > 0) {
    locales.forEach((locale) => {
      if (locale.regionCode === "VN") {
        isVietnam = true
      }
    })
  }
  return isVietnam
}

type ToolsItem = {
  label: TxKeyPath
  desc: TxKeyPath
  icon: ImageIconTypes
  routeName: keyof ToolsRoute
  premium?: boolean
  hide?: boolean
}

const TOOLS_ITEMS: ToolsItem[] = [
  {
    label: "pass_generator:title",
    desc: "pass_generator:desc",
    icon: "password-generator",
    routeName: "passwordGenerator",
  },
  {
    label: "private_relay:title",
    desc: "private_relay:tool",
    icon: "private-relay",
    routeName: "privateRelayStack",
  },
  {
    label: "pass_health:title",
    desc: "pass_health:desc",
    icon: "password-health",
    routeName: "passwordHealthStack",
    premium: true,
  },
  {
    label: "data_breach_scanner:title",
    desc: "data_breach_scanner:desc",
    icon: "data-breach-scanner",
    routeName: "dataBreachScannerStack",
    premium: true,
  },
  {
    label: "scam:tool.title",
    desc: "scam:tool.label",
    icon: "lookup",
    routeName: "scamStack",
    hide: !isVietnam(), // Hide if not in Vietnam
  },
]

export const ToolsListScreen: FC<TabsScreenProps<"toolsTab">> = ({ navigation }) => {
  const { user } = useStores()
  const {
    theme: { colors },
  } = useAppTheme()

  const isFreeAccount = user.isFreePlan

  // -----------------------METHODS----------------------------

  const handleNavigate = useCallback(
    (item: ToolsItem) => {
      if (item.premium && isFreeAccount) {
        navigation.navigate("menuStack", {
          screen: "payment",
        })
        return
      }
      navigation.navigate("toolsStack", { screen: item.routeName })
    },
    [isFreeAccount, navigation]
  )

  const $border: ViewStyle = {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  }
  return (
    <Screen
      preset="auto"
      disableAvoidkeyboard
      backgroundColor={colors.block}
      header={<TabHeader titleTx="common:tools" />}
      contentContainerStyle={styles.ph16}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        {Object.values(TOOLS_ITEMS)
          .filter((item) => !item.hide)
          .map((item, index) => {
            if (user.onPremiseUser && item.routeName === "privateRelayStack") {
              return null
            }

            return (
              <PressableScale
                key={index}
                onPress={() => {
                  handleNavigate(item)
                }}
                style={[styles.itemContainer, index !== TOOLS_ITEMS.length - 1 && $border]}
              >
                <ImageIcon icon={item.icon} size={40} containerStyle={styles.image} />

                <View style={styles.itemContent}>
                  <View style={styles.itemText}>
                    <Text tx={item.label} style={styles.mr8} />
                    {item.premium && isFreeAccount && <PremiumTag />}
                  </View>

                  <Text preset="label" tx={item.desc} size="sm" />
                </View>

                <Icon icon="caret-right" size={20} color={colors.label} style={styles.image} />
              </PressableScale>
            )
          })}
      </View>
    </Screen>
  )
}

export const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  image: {
    marginTop: 4,
  },
  itemContainer: {
    flexDirection: "row",
    paddingVertical: 12,
  },
  itemContent: {
    flex: 1,
    paddingHorizontal: 12,
  },
  itemText: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 2,
  },
  mr8: {
    marginRight: 8,
  },
  ph16: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
})
