/* eslint-disable react-native/no-inline-styles */
import { FC, useEffect, useState } from "react"
import { StyleSheet, useWindowDimensions, View } from "react-native"
import { observer } from "mobx-react-lite"
import { TabView } from "react-native-tab-view"

import { Header, PressableScale, Screen, Text } from "app/components/cores"
import { ShareScreenProps } from "app/navigators"

import { TxKeyPath } from "@/i18n"
import { PushNotifier } from "@/utils/pushNotification"
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
    const { sharedItemsData, collectionData, sortConfig, setSortConfig } = useSharedWithYou()

    console.log("SharedWithYouScreen render", sharedItemsData.length, collectionData.length)

    // ------------------------ PARAMS -------------------------

    const layout = useWindowDimensions()
    const [index, setIndex] = useState(0)
    const [isSortOpen, setIsSortOpen] = useState(false)

    // ------------------------ EFFECTS -------------------------

    // Clear noti
    useEffect(() => {
      PushNotifier.cancelNotification("share_new")
    }, [navigation])

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
        <View style={styles.segmentContainer}>
          <Segment
            onPress={() => setIndex(0)}
            selected={index === 0}
            tx="shares:shared_items"
            count={sharedItemsData.length}
          />
          <Segment
            onPress={() => setIndex(1)}
            selected={index === 1}
            tx="shares:shared_folder"
            count={collectionData.length}
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
  count: number
}
const Segment = ({ onPress, selected, tx, count }: SegmentProps) => {
  const {
    theme: { colors },
  } = useAppTheme()
  return (
    <PressableScale onPress={onPress}>
      <View
        style={[
          styles.segment,
          {
            borderColor: selected ? colors.primary : colors.disable,
          },
        ]}
      >
        <Text
          preset="bold"
          tx={tx}
          style={styles.segmentText}
          color={selected ? colors.primary : colors.disable}
        />
        <Text text={`(${count})`} color={selected ? colors.primary : colors.disable} />
      </View>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  segment: {
    alignItems: "center",
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: "row",
    marginRight: 24,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  segmentContainer: {
    alignItems: "center",
    flexDirection: "row",
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  segmentText: {
    marginRight: 4,
  },
})
