import React, { useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Text, Header, Button } from "../../../../../components"
import { useNavigation, useRoute } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../../../theme"
import { RouteProp } from "@react-navigation/native"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { NewFolderModal } from "../new-folder-modal"
import { FOLDER_IMG } from "../../../../../common/mappings"
import { useStores } from "../../../../../models"
import { useMixins } from "../../../../../services/mixins"
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { AccountRole } from "../../../../../config/types"
import { useFolderMixins } from "../../../../../services/mixins/folder"


type FolderSelectScreenProp = RouteProp<PrimaryParamList, 'folders__select'>;


export const FolderSelectScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<FolderSelectScreenProp>()
  const { mode, initialId, cipherIds = [] } = route.params
  const { folderStore, cipherStore, collectionStore } = useStores()
  const { notify, translate, notifyApiError, color, getTeam } = useMixins()
  const { shareFolderAddMultipleItems } = useFolderMixins()
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState(initialId)
  const isSelectedCollection = useRef(false)

  const organizations = cipherStore.organizations


  // Methods
  const handleMove = async () => {
    if (isSelectedCollection.current) {
      await handleMoveToCollection()
    } else {
      await handleMoveFolder()
    }
  }
  const handleMoveFolder = async () => {
    if (mode === 'move') {
      setIsLoading(true)
      const res = await cipherStore.moveToFolder({
        ids: cipherIds,
        folderId: selectedFolder
      })
      if (res.kind === 'ok') {
        notify('success', translate('folder.item_moved'))
      } else {
        notifyApiError(res)
      }
      setIsLoading(false)
    } else {
      cipherStore.setSelectedFolder(selectedFolder)
    }
    navigation.goBack()
  }

  const handleMoveToCollection = async () => {
    if (mode === 'move') {
      setIsLoading(true)
      const res = await shareFolderAddMultipleItems(
        collectionStore.collections.find(c => c.id === selectedFolder),
        cipherIds
      )
      if (res.kind === 'ok') {
        notify('success', translate('folder.item_moved'))
      } 
      setIsLoading(false)
    }
    navigation.goBack()
  }

  const renderItem = (item, index, isCollection: boolean) => (
    <Button
      key={index}
      preset="link"
      onPress={() => {
        setSelectedFolder(item.id)
        isSelectedCollection.current = isCollection
      }}
      style={[commonStyles.SECTION_PADDING, {
        backgroundColor: color.background
      }]}
    >
      <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
        {
          !isCollection ? <FOLDER_IMG.normal.svg height={30} />
            : <FOLDER_IMG.share.svg height={30} />
        }

        <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
          flex: 1,
          marginLeft: 10
        }]}>
          <Text
            preset="black"
            text={item.name}
            numberOfLines={2}
          />

          {
            ([...folderStore.notSynchedFolders, ...folderStore.notUpdatedFolders].includes(item.id)) && (
              <View style={{ marginLeft: 10 }}>
                <MaterialCommunityIconsIcon
                  name="cloud-off-outline"
                  size={22}
                  color={color.textBlack}
                />
              </View>
            )
          }
        </View>

        {
          selectedFolder === item.id && (
            <IoniconsIcon
              name="checkmark"
              size={18}
              color={color.primary}
            />
          )
        }
      </View>
    </Button>
  )

  // Render
  return (
    <Layout
      isContentOverlayLoading={isLoading}
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0
      }}
      header={(
        <Header
          title={
            mode === 'add'
              ? translate('folder.add_to_folder')
              : translate('folder.move_to_folder')
          }
          goBack={() => navigation.goBack()}
          goBackText={mode === 'move' ? translate('common.cancel') : undefined}
          right={(
            <Button
              preset="link"
              text={translate('common.save')}
              onPress={handleMove}
              style={{
                height: 35,
                alignItems: 'center'
              }}
              textStyle={{
                fontSize: fontSize.p
              }}
            />
          )}
        />
      )}
    >
      <NewFolderModal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
      />

      {/* None */}
      <Button
        preset="link"
        onPress={() => setSelectedFolder('unassigned')}
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.background,
          marginBottom: 10
        }]}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <Text
            tx={"folder.no_folder"}
            preset="black"
            style={{ flex: 1 }}
          />

          {
            !selectedFolder && (
              <IoniconsIcon
                name="checkmark"
                size={18}
                color={color.primary}
              />
            )
          }
        </View>
      </Button>
      {/* None end */}

      {/* Create */}
      <Button
        preset="link"
        onPress={() => setShowNewFolderModal(true)}
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.background
        }]}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <FOLDER_IMG.add.svg height={30} />
          <Text
            preset="black"
            text={translate('folder.new_folder')}
            style={{ flex: 1, marginLeft: 10 }}
          />
          <FontAwesomeIcon
            name="angle-right"
            size={20}
            color={color.text}
          />
        </View>
      </Button>
      {/* Create end */}

      {/* Other folders */}
      {
        folderStore.folders.filter(i => i.id).map((item, index) => renderItem(item, index, false))
      }
      {/* Other folders end */}

      <View style={{
        backgroundColor: color.background,
        marginVertical: 16
      }}>
        {
          collectionStore.collections?.filter(item => {
            const shareRole = getTeam(organizations, item.organizationId).type
            return shareRole === AccountRole.OWNER
          }).map((item, index) =>
            renderItem(item, index, true)
          )
        }
      </View>
    </Layout>
  )
})
