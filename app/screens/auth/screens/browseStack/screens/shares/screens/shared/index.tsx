/* eslint-disable react-native/no-inline-styles */
import { FC, useState } from "react"
import { StyleSheet, useWindowDimensions, View } from "react-native"
import { observer } from "mobx-react-lite"
import { TabView } from "react-native-tab-view"

import { Header, Icon, IconTypes, PressableScale, Screen, Text } from "app/components/cores"
import { ShareScreenProps } from "app/navigators"

import { TxKeyPath } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"

import { SharedCollectionList } from "./collections"
import { SharedItemsList } from "./items"
import { SharedSortAction } from "./SharedSortAction"
import { useSharedWithYou } from "./useSharedWithYou"

const routes = [
  { key: "items", title: "shares:shared_items" },
  { key: "collection", title: "shares:shared_folder" },
]

export const SharedWithYouScreen: FC<ShareScreenProps<"sharedWithYouCipherList">> = observer(
  ({ navigation }) => {
    const {
      sharedItemsData,
      collectionData,
      sortConfig,
      setSortConfig,
      pendingItemCount,
      pendingFolderCount,
    } = useSharedWithYou()
    const {
      theme: { colors },
    } = useAppTheme()

    // ------------------------ PARAMS -------------------------

    const layout = useWindowDimensions()
    const [index, setIndex] = useState(0)
    const [isSortOpen, setIsSortOpen] = useState(false)

    // ------------------------ RENDER -------------------------

    const renderScene = ({ route }: { route: (typeof routes)[number] }) => {
      switch (route.key) {
        case "items":
          return <SharedItemsList data={sharedItemsData} />
        case "collection":
          return <SharedCollectionList data={collectionData} />
        default:
          return null
      }
    }

    return (
      <Screen
        header={
          <Header
            leftIcon="arrow-left"
            titleTx={"shares:shared_items"}
            onLeftPress={navigation.goBack}
            rightIcon="sliders-horizontal"
            onRightPress={() => setIsSortOpen(true)}
          />
        }
        contentContainerStyle={styles.flex}
      >
        <SharedSortAction
          isOpen={isSortOpen}
          onClose={() => setIsSortOpen(false)}
          option={sortConfig.option}
          onSelect={setSortConfig}
        />
        <View style={[styles.segmentContainer, { borderColor: colors.border }]}>
          <Segment
            onPress={() => setIndex(0)}
            selected={index === 0}
            tx="shares:item"
            icon="lock-key"
            badgeCount={pendingItemCount}
          />
          <Segment
            onPress={() => setIndex(1)}
            selected={index === 1}
            tx="common:folder"
            icon="folder-simple"
            badgeCount={pendingFolderCount}
          />
        </View>
        <TabView
          swipeEnabled={false}
          renderTabBar={() => null}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
        />
      </Screen>
    )
  }
)

type SegmentProps = {
  onPress: () => void
  selected: boolean
  tx: TxKeyPath
  icon: IconTypes
  badgeCount?: number
}
const Segment = ({ onPress, selected, tx, icon, badgeCount }: SegmentProps) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const color = selected ? colors.primary : colors.text
  return (
    <PressableScale onPress={onPress}>
      <View
        style={[
          styles.segment,
          { borderBottomColor: selected ? colors.primary : colors.transparent },
        ]}
      >
        <Icon icon={icon} size={18} color={color} />
        <Text preset="bold" tx={tx} style={styles.segmentText} color={color} />
        {!!badgeCount && (
          <View style={[styles.noti, { backgroundColor: colors.error }]}>
            <Text
              text={badgeCount >= 100 ? "99+" : badgeCount.toString()}
              size="xxs"
              color={colors.white}
            />
          </View>
        )}
      </View>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  noti: {
    alignItems: "center",
    borderRadius: 20,
    height: 17,
    justifyContent: "center",
    marginLeft: 6,
    minWidth: 17,
    paddingHorizontal: 3,
  },
  segment: {
    alignItems: "center",
    borderBottomWidth: 2,
    flexDirection: "row",
    marginBottom: -1,
    marginRight: 24,
    paddingVertical: 10,
  },
  segmentContainer: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  segmentText: {
    marginLeft: 6,
  },
})
