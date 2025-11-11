import {
  Header,
  Icon,
  ImageIcon,
  ImageIconTypes,
  PressableScale,
  Screen,
  Text,
} from "@/components/cores"
import { MenuItemContainer } from "@/components/utils"
import { TxKeyPath } from "@/i18n"
import { ScamRoute, ScamScreenProps } from "@/navigators"
import { openScamUrl } from "@/utils/openLinkInBrowser"
import { useAppTheme } from "@/utils/useAppTheme"
import { FC } from "react"
import { StyleSheet, View } from "react-native"

// @ts-ignore
import { CallerContent } from "./CallerContent"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { AnonumousReport } from "./AnonymousReport"

type ToolsItem = {
  label: TxKeyPath
  desc: TxKeyPath
  icon: ImageIconTypes
  routeName: keyof ScamRoute
}

const SCAM_ITEMS: ToolsItem[] = [
  {
    label: "scam:home.lookup.title",
    desc: "scam:home.lookup.label",
    icon: "lookup",
    routeName: "lookup",
  },
  {
    label: "scam:home.report.title",
    desc: "scam:home.report.label",
    icon: "report",
    routeName: "report",
  },
  {
    label: "scam:home.myReportList.title",
    desc: "scam:home.myReportList.label",
    icon: "myReport",
    routeName: "myReportList",
  },
]

export const ScamHomeScreen: FC<ScamScreenProps<"scamList">> = ({ navigation }) => {
  const {
    theme: { colors },
  } = useAppTheme()

  const handleNavigate = (item: ToolsItem) => {
    // @ts-ignore
    navigation.navigate("scamStack", { screen: item.routeName })
  }

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["bottom"]}
      disableAvoidkeyboard
      backgroundColor={colors.block}
      header={
        <Header titleTx="scam:tool.title" leftIcon="arrow-left" onLeftPress={navigation.goBack} />
      }
      contentContainerStyle={styles.container}
    >
      <MenuItemContainer>
        {Object.values(SCAM_ITEMS).map((item, index) => {
          return (
            <PressableScale
              key={index}
              onPress={() => {
                handleNavigate(item)
              }}
              style={styles.itemContainer}
            >
              <ImageIcon icon={item.icon} size={40} containerStyle={styles.image} />

              <View style={styles.itemContent}>
                <Text tx={item.label} style={styles.itemText} />
                <Text preset="label" tx={item.desc} size="sm" />
              </View>

              <Icon icon="caret-right" size={20} color={colors.label} style={styles.image} />
            </PressableScale>
          )
        })}
      </MenuItemContainer>

      {/* <CallerContent /> */}
      <AnonumousReport />

      <MenuItemContainer>
        <PressableScale onPress={openScamUrl}>
          <View style={styles.itemContainer2}>
            <View style={styles.itemContent2}>
              <Text tx={"scam:home.otherScam"} style={styles.itemText} />
              <Text
                preset="label"
                tx={"scam:home.otherScamDesc"}
                size="xs"
                style={styles.itemLabel}
              />
              <View style={[styles.row, styles.mt12]}>
                <Text
                  weight="semiBold"
                  size="sm"
                  tx={"scam:home.checkNow"}
                  color={colors.primary}
                />
                <Icon size={18} icon="arrow-right" color={colors.primary} />
              </View>
            </View>
          </View>
        </PressableScale>
      </MenuItemContainer>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom + 16,
    paddingHorizontal: 16,
  },
  image: {
    marginTop: 4,
  },
  itemContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemContainer2: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemContent: {
    flex: 1,
    paddingHorizontal: 12,
  },
  itemContent2: {
    flex: 1,
    paddingRight: 12,
  },
  itemLabel: {
    marginTop: 4,
  },
  itemText: {
    flexGrow: 1,
    flexShrink: 1,
  },
  mt12: {
    marginTop: 16,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
