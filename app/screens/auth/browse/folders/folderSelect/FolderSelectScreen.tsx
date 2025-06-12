import React, { FC, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { TouchableOpacity, View, SectionList } from "react-native"
import { NewFolderModal } from "../NewFolderModal"
import { useStores } from "app/models"
import { useFolder, useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"
import { Button, Header, Icon, ImageIcon, Screen, Text } from "app/components/cores"
import { AccountRole } from "app/static/types"
import { AppStackScreenProps } from "app/navigators/navigators.types"
import { MoveItemToSharedFolderWarningModal } from "./MoveItemToSharedFolderWarningModal"

export const FolderSelectScreen: FC<AppStackScreenProps<"folders__select">> = observer((props) => {
  const navigation = props.navigation
  const route = props.route
  const { mode, initialId, cipherIds = [] } = route.params
  const { folderStore, cipherStore, collectionStore } = useStores()
  const { colors } = useTheme()
  const { notify, notifyApiError, getTeam, translate } = useHelper()
  const { shareFolderAddMultipleItems } = useFolder()

  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState(initialId)
  const isSelectedCollection = useRef(false)

  const [isOpenMoveItemToSharedFolderWarningModal, setIsOpenMoveItemToSharedFolderWarningModal] =
    useState(false)

  const organizations = cipherStore.organizations

  // Methods
  const handleMove = async () => {
    setIsLoading(true)
    if (isSelectedCollection.current) {
      await handleMoveToCollection()
    } else {
      await handleMoveFolder()
    }
    setIsLoading(false)
  }
  const handleMoveFolder = async () => {
    if (mode === "move") {
      const res = await cipherStore.moveToFolder({
        ids: cipherIds,
        folderId: selectedFolder,
      })
      if (res.kind === "ok") {
        notify("success", translate("folder.item_moved"))
      } else {
        notifyApiError(res)
      }
    } else {
      cipherStore.setSelectedFolder(selectedFolder)
    }
    navigation.goBack()
  }

  const handleMoveToCollection = async () => {
    if (mode === "move") {
      const res = await shareFolderAddMultipleItems(
        collectionStore.collections.find((c) => c.id === selectedFolder),
        cipherIds,
      )
      if (res.kind === "ok") {
        notify("success", translate("folder.item_moved"))
      }
    } else {
      cipherStore.setSelectedCollection(selectedFolder)
    }
    navigation.goBack()
  }
  const showNofiAddItemToShareFolder = () => {
    setIsOpenMoveItemToSharedFolderWarningModal(true)
  }

  const renderItem = ({ item, index, section }) => (
    <TouchableOpacity
      key={index}
      onPress={() => {
        setSelectedFolder(item.id)
        isSelectedCollection.current = section.isCollection
      }}
      style={{
        padding: 16,
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
        borderBottomWidth: 1,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <ImageIcon icon={!section.isCollection ? "folder" : "folder-share"} size={30} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
            marginLeft: 10,
          }}
        >
          <Text text={item.name} numberOfLines={2} />

          {[...folderStore.notSynchedFolders, ...folderStore.notUpdatedFolders].includes(
            item.id,
          ) && (
            <View style={{ marginLeft: 10 }}>
              <Icon icon="wifi-slash" size={22} color={colors.title} />
            </View>
          )}
        </View>

        {selectedFolder === item.id && (
          <Icon icon="check" size={18} color={colors.primary} style={{ marginLeft: 8 }} />
        )}
      </View>
    </TouchableOpacity>
  )

  const sections = [
    {
      title: translate("common.folder"),
      data: folderStore.folders.filter((i) => i.id).sort((a, _) => (a.id === initialId ? -1 : 1)),
      isCollection: false,
    },
    {
      title: translate("shares.shared_folder"),
      data:
        collectionStore.collections?.filter((item) => {
          const shareRole = getTeam(organizations, item.organizationId).type
          return shareRole === AccountRole.OWNER || shareRole === AccountRole.ADMIN
        }) || [],
      isCollection: true,
    },
  ]

  // Render
  return (
    <Screen
      backgroundColor={colors.block}
      safeAreaEdges={["bottom"]}
      header={
        <Header
          title={
            mode === "add" ? translate("folder.add_to_folder") : translate("folder.move_to_folder")
          }
          onLeftPress={() => navigation.goBack()}
          leftText={translate("common.cancel")}
          RightActionComponent={
            <Button
              loading={isLoading}
              preset="teriatary"
              disabled={isLoading}
              onPress={handleMove}
              text={translate("common.save")}
            />
          }
        />
      }
      contentContainerStyle={{
        flex: 1,
      }}
    >
      <MoveItemToSharedFolderWarningModal
        isOpen={isOpenMoveItemToSharedFolderWarningModal}
        onClose={() => setIsOpenMoveItemToSharedFolderWarningModal(false)}
      />
      <NewFolderModal isOpen={showNewFolderModal} onClose={() => setShowNewFolderModal(false)} />

      <TouchableOpacity
        onPress={() => setSelectedFolder("unassigned")}
        style={{
          backgroundColor: colors.background,
          padding: 16,
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text tx={"folder.no_folder"} style={{ flex: 1 }} />

          {selectedFolder === "unassigned" && (
            <Icon icon="check" size={18} color={colors.primary} />
          )}
        </View>
      </TouchableOpacity>

      {/* Create */}
      <TouchableOpacity
        onPress={() => setShowNewFolderModal(true)}
        style={{
          backgroundColor: colors.background,
          padding: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <ImageIcon size={30} icon="folder-add" />

          <Text text={translate("folder.new_folder")} style={{ flex: 1, marginLeft: 10 }} />
          <Icon icon="caret-right" size={20} color={colors.title} />
        </View>
      </TouchableOpacity>

      <SectionList
        stickySectionHeadersEnabled={false}
        sections={sections}
        keyExtractor={(item, index) => item.id + index}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title, data, isCollection } }) => {
          return (
            data.length > 0 && (
              <View
                style={{
                  backgroundColor: colors.background,
                  marginTop: 16,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  text={title}
                  numberOfLines={1}
                  style={{
                    flexGrow: 1,
                    flexShrink: 1,
                    fontWeight: "bold",
                    marginRight: 8,
                  }}
                />
                {isCollection && mode === "move" && (
                  <Icon icon="info" onPress={showNofiAddItemToShareFolder} color={colors.warning} />
                )}
              </View>
            )
          )
        }}
      />
    </Screen>
  )
})
