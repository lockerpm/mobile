/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-unused-styles */
import {
  Header,
  Icon,
  ImageIcon,
  ImageIconTypes,
  PressableScale,
  Screen,
  Switch,
  Text,
} from "@/components/cores"
import { MenuItemContainer } from "@/components/utils"
import { TxKeyPath } from "@/i18n"
import { useStores } from "@/models"
import { ScamRoute, ScamScreenProps } from "@/navigators"
import { toolApi } from "@/services/api"
import { openScamUrl } from "@/utils/openLinkInBrowser"
import { useAppTheme } from "@/utils/useAppTheme"
import { FC } from "react"
import { StyleSheet, View } from "react-native"

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
  const { user } = useStores()
  const {
    theme: { colors },
  } = useAppTheme()

  const handleNavigate = (item: ToolsItem) => {
    // @ts-ignore
    navigation.navigate("scamStack", { screen: item.routeName })
  }

  const handleSyncScamList = async () => {
    const res = await toolApi.scamSyncPhones(user.apiToken)
    if (res.kind === "ok") {
      console.log("Scam list synced successfully", res.data)
    }
  }

  return (
    <Screen
      preset="scroll"
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

      <MenuItemContainer>
        <PressableScale style={styles.itemContainer2} onPress={handleSyncScamList}>
          <View style={styles.itemContent2}>
            <Text tx={"scam:home.getWarning"} style={styles.itemText} />
            <Text
              preset="label"
              tx={"scam:home.getWarningDesc"}
              size="xs"
              style={styles.itemLabel}
            />
          </View>

          <Switch value={true} />
        </PressableScale>

        <PressableScale style={styles.itemContainer2} onPress={openScamUrl}>
          <View style={styles.itemContent2}>
            <Text tx={"scam:home.otherScam"} style={styles.itemText} />
            <Text
              preset="label"
              tx={"scam:home.otherScamDesc"}
              size="xs"
              style={styles.itemLabel}
            />
          </View>

          <View style={styles.row}>
            <Text weight="semiBold" size="sm" tx={"scam:home.checkNow"} color={colors.primary} />
            <Icon size={18} icon="arrow-right" color={colors.primary} />
          </View>
        </PressableScale>
      </MenuItemContainer>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
