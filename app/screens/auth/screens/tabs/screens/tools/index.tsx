import React, { FC, useCallback } from "react"
import { View, TouchableOpacity, StyleSheet } from "react-native"
import { useStores } from "app/models"
import { Text, Screen, Icon, ImageIcon, ImageIconTypes } from "app/components/cores"
import { useTheme } from "app/services/context"
import { TabHeader } from "app/components/cores/header/TabHeader"
import { PremiumTag } from "app/components/utils"

import { TabsScreenProps, ToolsRoute } from "app/navigators"
import { TxKeyPath } from "app/i18n"

type ToolsItem = {
  label: TxKeyPath
  desc: TxKeyPath
  icon: ImageIconTypes
  routeName: keyof ToolsRoute
  premium?: boolean
}

const TOOLS_ITEMS: ToolsItem[] = [
  {
    label: "pass_generator.title",
    desc: "pass_generator.desc",
    icon: "password-generator",
    routeName: "passwordGenerator",
  },
  {
    label: "private_relay.title",
    desc: "private_relay.tool",
    icon: "private-relay",
    routeName: "privateRelayStack",
  },
  {
    label: "pass_health.title",
    desc: "pass_health.desc",
    icon: "password-health",
    routeName: "passwordHealthStack",
    premium: true,
  },
  {
    label: "data_breach_scanner.title",
    desc: "data_breach_scanner.desc",
    icon: "data-breach-scanner",
    routeName: "dataBreachScannerStack",
    premium: true,
  },
]

export const ToolsListScreen: FC<TabsScreenProps<"toolsTab">> = ({ navigation }) => {
  const { user } = useStores()
  const { colors } = useTheme()

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
    [isFreeAccount],
  )

  return (
    <Screen padding backgroundColor={colors.block} header={<TabHeader titleTx="common.tools" />}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        {Object.values(TOOLS_ITEMS).map((item, index) => {
          if (user.onPremiseUser && item.routeName === "privateRelayStack") {
            return null
          }

          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                handleNavigate(item)
              }}
              style={[
                styles.itemContainer,
                {
                  borderBottomColor: colors.border,
                  borderBottomWidth: index === Object.keys(TOOLS_ITEMS).length - 1 ? 0 : 1,
                },
              ]}
            >
              <ImageIcon icon={item.icon} size={40} />

              <View style={styles.itemContent}>
                <View style={styles.itemText}>
                  <Text tx={item.label} style={styles.mb4} />

                  {item.premium && isFreeAccount && <PremiumTag style={styles.ml8} />}
                </View>

                <Text preset="label" tx={item.desc} size="base" />
              </View>

              <Icon icon="caret-right" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          )
        })}
      </View>
    </Screen>
  )
}

export const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  itemContainer: {
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 12,
  },
  itemContent: {
    flex: 1,
    paddingHorizontal: 10,
  },
  itemText: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  mb4: {
    marginBottom: 4,
  },
  ml8: {
    marginLeft: 8,
  },
})
