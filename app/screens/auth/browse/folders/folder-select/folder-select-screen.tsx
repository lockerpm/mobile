import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Text, Header, Button, AutoImage as Image } from "../../../../../components"
import { useNavigation, useRoute } from "@react-navigation/native"
import { color, commonStyles } from "../../../../../theme"
import { RouteProp } from "@react-navigation/native"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { NewFolderModal } from "../new-folder-modal"
import { FOLDER_IMG } from "../../../../../common/mappings"
import { useStores } from "../../../../../models"
import { useMixins } from "../../../../../services/mixins"


type FolderSelectScreenProp = RouteProp<PrimaryParamList, 'folders__select'>;


export const FolderSelectScreen = observer(function FolderSelectScreen() {
  const navigation = useNavigation()
  const route = useRoute<FolderSelectScreenProp>()
  const { mode, initialId, cipherIds = [] } = route.params
  const { folderStore, cipherStore } = useStores()
  const { notify } = useMixins()

  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState(initialId)

  // Methods

  const handleMove = async () => {
    if (mode === 'move') {
      setIsLoading(true)
      const res = await cipherStore.moveToFolder({
        ids: cipherIds,
        folderId: selectedFolder
      })
      if (res.kind === 'ok') {
        notify('success', '', 'Moved to new folder')
      } else {
        notify('error', '', 'Something went wrong')
      }
      setIsLoading(false)
    } else {
      cipherStore.setSelectedFolder(selectedFolder)
    }
    navigation.goBack()
  }

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
          title={mode === 'add' ? 'Add to Folder' : 'Move to Folder'}
          goBack={() => navigation.goBack()}
          goBackText={mode === 'move' ? "Cancel" : undefined}
          right={(
            <Button
              preset="link"
              text="Save"
              onPress={handleMove}
              textStyle={{
                fontSize: 12
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
        onPress={() => setSelectedFolder(null)}
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.palette.white,
          marginBottom: 10
        }]}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <Text preset="black" style={{ flex: 1 }}>
            No folder
          </Text>

          {
            !selectedFolder && (
              <IoniconsIcon
                name="checkmark"
                size={18}
                color={color.palette.green}
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
          backgroundColor: color.palette.white
        }]}
      >
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <Image
            source={FOLDER_IMG.add.img}
            style={{ height: 30, marginRight: 10 }}
          />
          <Text preset="black" style={{ flex: 1 }}>
            New Folder
          </Text>
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
        folderStore.folders.filter(i => i.id).map((item, index) => (
          <Button
            key={index}
            preset="link"
            onPress={() => setSelectedFolder(item.id)}
            style={[commonStyles.SECTION_PADDING, {
              backgroundColor: color.palette.white
            }]}
          >
            <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
              <Image
                source={FOLDER_IMG.normal.img}
                style={{ height: 30, marginRight: 10 }}
              />
              <Text preset="black" style={{ flex: 1 }}>
                {item.name}
              </Text>

              {
                selectedFolder === item.id && (
                  <IoniconsIcon
                    name="checkmark"
                    size={18}
                    color={color.palette.green}
                  />
                )
              }
            </View>
          </Button>
        ))
      }
      {/* Other folders end */}
    </Layout>
  )
})
