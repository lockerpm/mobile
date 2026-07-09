/* eslint-disable react-native/no-inline-styles */
import { useState, FC, useCallback } from "react"
import { StyleSheet, useWindowDimensions, View } from "react-native"
import { observer } from "mobx-react-lite"
import { TabView, SceneMap } from "react-native-tab-view"

import { Header, PressableScale, Screen, Text } from "app/components/cores"
import { useStores } from "app/models"
import { BrowseScreenProps } from "app/navigators"

import { TxKeyPath } from "@/i18n"
import { FolderActionsModal } from "@/static/types"
import { useAppTheme } from "@/utils/useAppTheme"

import { CollectionList } from "./collections"
import { FolderList } from "./folders"

const renderScene = SceneMap({
  folder: FolderList,
  collection: CollectionList,
})

const routes = [
  { key: "folder", title: "common:folder" },
  { key: "collection", title: "shares:shared_folder" },
]

export const FolderListScreen: FC<BrowseScreenProps<"folderList">> = observer(({ navigation }) => {
  const { folderStore, collectionStore } = useStores()

  const folderCount = folderStore.folders.length
  const collectionCount = collectionStore.collections.length

  // ------------------- PARAMS ---------------------

  const layout = useWindowDimensions()
  const [index, setIndex] = useState(0)

  // ------------------- COMPUTED ---------------------

  // ------------------- METHODS ---------------------

  const navigateToCreateFolder = useCallback(() => {
    navigation.navigate("folderActionModal", {
      mode: FolderActionsModal.CREATE,
    })
    setIndex(0)
  }, [navigation])

  // ------------------- RENDER ---------------------
  return (
    <Screen
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={navigation.goBack}
          titleTx="common:folders"
          rightIcon="plus"
          onRightPress={navigateToCreateFolder}
        />
      }
      contentContainerStyle={styles.flex}
    >
      <View style={styles.segmentContainer}>
        <Segment
          onPress={() => setIndex(0)}
          selected={index === 0}
          tx="common:folder"
          count={folderCount}
        />
        <Segment
          onPress={() => setIndex(1)}
          selected={index === 1}
          tx="shares:shared_folder"
          count={collectionCount}
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
})

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
    paddingHorizontal: 16,
  },
  segmentText: {
    marginRight: 4,
  },
})
