/* eslint-disable react-native/no-inline-styles */
import { useState, FC, useCallback, ReactNode } from "react"
import { StyleSheet, useWindowDimensions, View } from "react-native"
import { observer } from "mobx-react-lite"
import { TabView, SceneMap } from "react-native-tab-view"

import { Header, ImageIcon, PressableScale, Screen, Text } from "app/components/cores"
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
  const {
    theme: { colors },
  } = useAppTheme()

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
      <View style={[styles.segmentContainer, { borderColor: colors.border }]}>
        <Segment
          onPress={() => setIndex(0)}
          selected={index === 0}
          tx="common:folder"
          renderIcon={() => <ImageIcon icon="folder" size={18} />}
        />
        <Segment
          onPress={() => setIndex(1)}
          selected={index === 1}
          tx="shares:shared_folder"
          renderIcon={() => <ImageIcon icon="folder-share" size={18} />}
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
  renderIcon: (color: string) => ReactNode
}
const Segment = ({ onPress, selected, tx, renderIcon }: SegmentProps) => {
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
        {renderIcon(color)}
        <Text preset="bold" tx={tx} style={styles.segmentText} color={color} />
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
