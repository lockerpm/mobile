import { useState, FC, useCallback, useRef } from "react"
import { observer } from "mobx-react-lite"
import { Platform, SectionList, StyleSheet, View, ViewStyle } from "react-native"
import {
  Header,
  Icon,
  ImageIcon,
  PressableIcon,
  PressableScale,
  Screen,
  Text,
} from "app/components/cores"
import { useStores } from "app/models"
import { BrowseScreenProps } from "app/navigators"
import { useAppTheme } from "@/utils/useAppTheme"
import { TxKeyPath } from "@/i18n"
import { AccountRole, FolderActionsModal } from "@/static/types"
import { useToast } from "@/services/utils"
import { useFolder } from "@/services/hook"
import { getTeam } from "@/utils/cipherHelper"
import { FolderView } from "core/models/view/folderView"
import { CollectionView } from "core/models/view/collectionView"
import { ThemedStyle } from "@/theme"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { AppEventType, EventBus } from "@/utils/eventBus"
import { MoveItemToSharedFolderWarningModal } from "./MoveItemToSharedFolderWarningModal"

export const FolderSelectScreen: FC<BrowseScreenProps<"folderSelect">> = observer(
  ({
    navigation,
    route: {
      params: { mode, initialId = "unassigned", cipherIds = [] },
    },
  }) => {
    const { folderStore, cipherStore, collectionStore } = useStores()

    const {
      themed,
      theme: { colors },
    } = useAppTheme()
    const { notifyTx, notifyApiError } = useToast()
    const { shareFolderAddMultipleItems } = useFolder()

    // ------------------- PARAMS ---------------------

    const [isLoading, setIsLoading] = useState(false)
    const [selectedFolderId, setSelectedFolderId] = useState(initialId)
    const isSelectedCollection = useRef(false)
    const [isOpenMoveItemToSharedFolderWarningModal, setIsOpenMoveItemToSharedFolderWarningModal] =
      useState(false)

    // ------------------- COMPUTED ---------------------
    const organizations = cipherStore.organizations
    // ------------------- METHODS ---------------------

    const showNofiAddItemToShareFolder = useCallback(() => {
      setIsOpenMoveItemToSharedFolderWarningModal(true)
    }, [])

    const navigateToCreateFolder = useCallback(() => {
      navigation.navigate("folderActionModal", {
        mode: FolderActionsModal.CREATE,
      })
    }, [navigation])

    const onSelectItem = useCallback((id: string, isCollection: boolean) => {
      isSelectedCollection.current = isCollection
      setSelectedFolderId(id)
    }, [])

    // Methods
    const handleMove = async () => {
      setIsLoading(true)
      if (mode === "move") {
        if (isSelectedCollection.current) {
          await handleMoveToCollection()
        } else {
          await handleMoveFolder()
        }
      } else {
        EventBus.emit(AppEventType.CIPHER_EDIT_FOLDER_SELECT, {
          id: selectedFolderId,
          isCollection: isSelectedCollection.current,
        })
      }
      EventBus.emit(AppEventType.UNSELECT_ALL, null)

      setIsLoading(false)
      navigation.goBack()
    }
    const handleMoveFolder = async () => {
      const res = await cipherStore.moveToFolder({
        ids: cipherIds,
        folderId: selectedFolderId,
      })
      if (res.kind === "ok") {
        notifyTx("success", "folder:item_moved")
      } else {
        notifyApiError(res)
      }
    }

    const handleMoveToCollection = async () => {
      await shareFolderAddMultipleItems(
        collectionStore.collections.find((c) => c.id === selectedFolderId),
        cipherIds
      )
    }

    // ------------------- RENDER ---------------------

    const sections = [
      {
        titleTx: "common:folder",
        data: folderStore.folders.filter((i) => i.id).sort((a, _) => (a.id === initialId ? -1 : 1)),
        isCollection: false,
      },
      {
        titleTx: "shares:shared_folder",
        data:
          collectionStore.collections?.filter((item) => {
            const shareRole = getTeam(organizations, item.organizationId).type
            return shareRole === AccountRole.OWNER || shareRole === AccountRole.ADMIN
          }) || [],
        isCollection: true,
      },
    ]

    return (
      <Screen
        header={
          <Header
            titleTx={mode === "add" ? "folder:add_to_folder" : "folder:move_to_folder"}
            onLeftPress={navigation.goBack}
            leftTx={"common:cancel"}
            rightLoading={isLoading}
            rightDisabled={isLoading}
            onRightPress={handleMove}
            rightTx="common:save"
            rightIconColor={colors.primary}
          />
        }
        contentContainerStyle={styles.flex}
      >
        <MoveItemToSharedFolderWarningModal
          isOpen={isOpenMoveItemToSharedFolderWarningModal}
          onClose={() => setIsOpenMoveItemToSharedFolderWarningModal(false)}
        />
        <SectionList
          stickySectionHeadersEnabled={false}
          sections={sections}
          contentContainerStyle={styles.ph16}
          keyExtractor={(item, index) => item.id + index}
          renderItem={({ item, section }) => {
            return (
              <RenderItem
                selectedId={selectedFolderId}
                item={item}
                isCollection={section.isCollection}
                setSelectedFolderId={onSelectItem}
              />
            )
          }}
          ListHeaderComponent={
            <>
              <PressableScale onPress={navigateToCreateFolder} style={themed($itemContainer)}>
                <View style={styles.row}>
                  <ImageIcon size={30} icon="folder-add" />
                  <Text tx="folder:new_folder" style={styles.itemName} />
                  <Icon icon="caret-right" size={20} color={colors.title} />
                </View>
              </PressableScale>

              <PressableScale
                onPress={() => setSelectedFolderId("unassigned")}
                style={themed($itemContainer)}
              >
                <View style={styles.row}>
                  <Text tx={"folder:no_folder"} style={styles.noFolder} />

                  {selectedFolderId === "unassigned" && (
                    <Icon icon="check" size={18} color={colors.primary} />
                  )}
                </View>
              </PressableScale>
            </>
          }
          renderSectionHeader={({ section: { titleTx, data, isCollection } }) => {
            return data.length > 0 ? (
              <View style={styles.row}>
                <Text
                  preset="bold"
                  tx={titleTx as TxKeyPath}
                  numberOfLines={1}
                  style={styles.headerText}
                />
                {isCollection && mode === "move" && (
                  <PressableIcon
                    icon="info"
                    onPress={showNofiAddItemToShareFolder}
                    color={colors.warning}
                  />
                )}
              </View>
            ) : null
          }}
        />
      </Screen>
    )
  }
)

type ItemProps = {
  selectedId: string
  item: FolderView | CollectionView
  isCollection: boolean
  setSelectedFolderId: (id: string, isCollection: boolean) => void
}

const RenderItem = ({ selectedId, item, isCollection, setSelectedFolderId }: ItemProps) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  return (
    <PressableScale
      onPress={() => {
        setSelectedFolderId(item.id, isCollection)
      }}
      style={themed($itemContainer)}
    >
      <View style={styles.row}>
        <ImageIcon icon={!isCollection ? "folder" : "folder-share"} size={30} />
        <View style={styles.itemName}>
          <Text text={item.name} ellipsizeMode="tail" numberOfLines={2} />
        </View>

        {selectedId === item.id && <Icon icon="check" size={18} color={colors.primary} />}
      </View>
    </PressableScale>
  )
}

const $itemContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 12,
  borderColor: colors.border,
  borderWidth: 1,
  marginVertical: 8,
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  headerText: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 8,
  },
  itemName: {
    flexGrow: 1,
    flexShrink: 1,
    marginHorizontal: 12,
  },
  noFolder: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  ph16: {
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom + (Platform.OS === "ios" ? 8 : 16),
    paddingHorizontal: 16,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
