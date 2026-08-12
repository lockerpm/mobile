/* eslint-disable react-native/no-inline-styles */
import { FC, useCallback, useState } from "react"
import { StyleSheet, useWindowDimensions, View } from "react-native"
import { observer } from "mobx-react-lite"
import { TabView } from "react-native-tab-view"

import { Header, Icon, IconTypes, PressableScale, Screen, Text } from "app/components/cores"
import { useStores } from "app/models"
import { ShareScreenProps } from "app/navigators"
import {
  CipherActionsModal,
  CipherAppView,
  ConfirmShareItemInfo,
  FolderActionsModal,
  SharedMemberType,
  SharingStatus,
} from "app/static/types"
import { CollectionView } from "core/models/view/collectionView"

import { TxKeyPath } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"

import { YourShareCollectionList } from "./collections"
import { YourShareItemsList } from "./items"
import { useYourShare } from "./useYourShare"
import { YourShareSortAction } from "./YourShareSortAction"

const routes = [
  { key: "items", title: "shares:item" },
  { key: "collection", title: "common:folder" },
]

export const YourShareScreen: FC<ShareScreenProps<"yourShareCipherList">> = observer(
  ({ navigation }) => {
    const { user } = useStores()
    const { itemsData, collectionData, sortConfig, setSortConfig } = useYourShare()
    const {
      theme: { colors },
    } = useAppTheme()

    // --------------------- PARAMS -------------------------

    const layout = useWindowDimensions()
    const [index, setIndex] = useState(0)
    const [isSortOpen, setIsSortOpen] = useState(false)

    const isFreeAccount = user.isFreePlan

    // --------------------- METHODS -------------------------

    const navigateToAddShareItem = useCallback(() => {
      if (user.isFreePlan) {
        navigation.navigate("cipherActionsModal", {
          mode: CipherActionsModal.PREMIUM_ACTION,
          deleteIds: [],
        })
      }
      navigation.navigate("mainTab", {
        screen: "homeTab",
      })
    }, [navigation, user.isFreePlan])

    const navigateToCipherActions = useCallback(
      (item: CipherAppView) => {
        const data: CipherAppView = {
          ...item,
        }
        navigation.navigate("cipherActionsModal", {
          mode: CipherActionsModal.DEFAULT,
          item: data,
          deleteIds: [item.id],
        })
      },
      [navigation]
    )

    const navigateToShareConfirmModal = useCallback(
      (item: ConfirmShareItemInfo, members: SharedMemberType[], organizationId: string) => {
        navigation.replace("confirmYourShare", {
          item,
          members: members.filter((m) => m.status === SharingStatus.ACCEPTED),
          organizationId,
        })
      },
      [navigation]
    )

    const navigateCollectionActions = useCallback(
      (collection: CollectionView) => {
        navigation.navigate("folderActionModal", {
          mode: FolderActionsModal.DEFAULT,
          collection,
        })
      },
      [navigation]
    )

    // --------------------- RENDER -------------------------

    const renderScene = ({ route }: { route: (typeof routes)[number] }) => {
      switch (route.key) {
        case "items":
          return (
            <YourShareItemsList
              data={itemsData}
              isFreeAccount={isFreeAccount}
              openAdd={navigateToAddShareItem}
              openAction={navigateToCipherActions}
              openConfirmModal={navigateToShareConfirmModal}
            />
          )
        case "collection":
          return (
            <YourShareCollectionList
              data={collectionData}
              isFreeAccount={isFreeAccount}
              openAdd={navigateToAddShareItem}
              openAction={navigateCollectionActions}
              openConfirmModal={navigateToShareConfirmModal}
            />
          )
        default:
          return null
      }
    }

    return (
      <Screen
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            titleTx="shares:share_items"
            rightIcon="sliders-horizontal"
            onRightPress={() => setIsSortOpen(true)}
          />
        }
        contentContainerStyle={styles.flex}
      >
        <YourShareSortAction
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
          />
          <Segment
            onPress={() => setIndex(1)}
            selected={index === 1}
            tx="common:folder"
            icon="folder-simple"
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
}
const Segment = ({ onPress, selected, tx, icon }: SegmentProps) => {
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
