import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import groupBy from 'lodash/groupBy'
import orderBy from 'lodash/orderBy'
import {
  Layout, BrowseItemHeader, BrowseItemEmptyContent, Text, Button
} from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { SortAction } from "../../home/all-item/sort-action"
import { SectionList, View } from "react-native"
import { color as colorLight, colorDark, commonStyles, fontSize } from "../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { NewFolderModal } from "./new-folder-modal"
import { FolderAction } from "./folder-action"
import { FOLDER_IMG } from "../../../../common/mappings"
import { useStores } from "../../../../models"
import { FolderView } from "../../../../../core/models/view/folderView"
import { CollectionView } from "../../../../../core/models/view/collectionView"
import { useMixins } from "../../../../services/mixins"
import { TEAM_COLLECTION_EDITOR } from "../../../../config/constants"


export const FoldersScreen = observer(function FoldersScreen() {
  const navigation = useNavigation()
  const { getTeam, randomString, translate } = useMixins()
  const { folderStore, collectionStore, user, uiStore } = useStores()
  const folders: FolderView[] = folderStore.folders
  const collections: CollectionView[] = collectionStore.collections
  const color = uiStore.isDark ? colorDark : colorLight

  // Params

  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isActionOpen, setIsActionOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [sortList, setSortList] = useState({
    orderField: 'name',
    order: 'asc'
  })
  const [sortOption, setSortOption] = useState('az')
  const [selectedFolder, setSelectedFolder] = useState(new FolderView())
  const [isLoading, setIsLoading] = useState(false)

  // Computed

  const getFilteredData = (items: any[], shared: boolean, editable: boolean) => {
    const filtered = items.filter((item: FolderView | CollectionView) => {
      if (searchText) {
        return item.name && item.name.toLowerCase().includes(searchText.toLowerCase())
      }
      return true
    })
    if (sortList) {
      const { orderField, order } = sortList
      const result = orderBy(
        filtered,
        [f => orderField === 'name' ? (f.name && f.name.toLowerCase()) : f.revisionDate],
        [order]
      ).map(i => ({ ...i, shared, editable })) || []
      return result
    }
    return filtered
  }
  const filteredCollection = groupBy(collections, 'organizationId')
  const sections = [
    {
      id: randomString(),
      title: translate('common.me'),
      data: getFilteredData(folders, false, true),
    },
    ...Object.keys(filteredCollection).map((id) => ({
      id: randomString(),
      title: getTeam(user.teams, id).name,
      data: getFilteredData(
        filteredCollection[id], 
        true, 
        TEAM_COLLECTION_EDITOR.includes(getTeam(user.teams, id).role) && !uiStore.isOffline
      )
    }))
  ]

  // Render

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <BrowseItemHeader
          header={translate('common.folder')}
          openSort={() => setIsSortOpen(true)}
          openAdd={() => setIsAddOpen(true)}
          navigation={navigation}
          searchText={searchText}
          onSearch={setSearchText} 
          isSelecting={false} 
          setIsSelecting={() => {}} 
          selectedItems={[]} 
          setSelectedItems={() => {}} 
          toggleSelectAll={() => {}} 
          setIsLoading={() => {}}        
        />
      )}
      borderBottom
      noScroll
    >
      {/* Modals / Actions */}

      <FolderAction
        isOpen={isActionOpen}
        onClose={() => setIsActionOpen(false)}
        folder={selectedFolder}
        onLoadingChange={setIsLoading}
      />

      <SortAction
        byNameOnly
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        onSelect={(value: string, obj: { orderField: string, order: string }) => {
          setSortOption(value)
          setSortList(obj)
        }}
        value={sortOption}
      />

      <NewFolderModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      {/* Modals / Actions end */}

      {/* Content */}
      {
        !sections.length ? (
          <BrowseItemEmptyContent
            img={require('./empty-img.png')}
            imgStyle={{ height: 55, width: 55 }}
            title={translate('folder.empty.title')}
            desc={translate('folder.empty.desc')}
            buttonText={translate('folder.empty.btn')}
            addItem={() => {
              setIsAddOpen(true)
            }}
          />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            renderSectionHeader={({ section }) => (
              <Text
                text={`${section.title} (${section.data.length})`}
                style={{ 
                  fontSize: fontSize.small, 
                  paddingHorizontal: 20, 
                  paddingTop: 20, 
                  backgroundColor: color.background 
                }}
              />
            )}
            renderItem={({ item }) => (
              <View style={{ paddingHorizontal: 20 }}>
                <Button
                  preset="link"
                  onPress={() => {
                    if (item.shared) {
                      navigation.navigate('folders__ciphers', { collectionId: item.id })
                    } else {
                      navigation.navigate('folders__ciphers', { folderId: item.id })
                    }
                  }}
                  style={{
                    borderBottomColor: color.line,
                    borderBottomWidth: 0.5,
                    paddingVertical: 15,
                  }}
                >
                  <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
                    {
                      item.shared ? (
                        <FOLDER_IMG.share.svg height={30} />
                      ) : (
                        <FOLDER_IMG.normal.svg height={30} />
                      )
                    }

                    <View style={{ 
                      flex: 1, 
                      marginLeft: 12, 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      flexWrap: 'wrap' 
                    }}>
                      <Text
                        preset="semibold"
                        text={
                          (item.name || translate('folder.unassigned')) 
                          + (item.cipherCount !== undefined ? ` (${item.cipherCount})` : '')
                        }
                      />

                      {
                        folderStore.notSynchedFolders.includes(item.id) && (
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
                      (!!item.id && item.editable) && (
                        <Button
                          preset="link"
                          onPress={() => {
                            setSelectedFolder(item)
                            setIsActionOpen(true)
                          }}
                          style={{ height: 30, alignItems: 'center'}}
                        >
                          <IoniconsIcon
                            name="ellipsis-horizontal"
                            size={18}
                            color={color.textBlack}
                          />
                        </Button>
                      )
                    }
                  </View>
                </Button>
              </View>
            )}
          />
        )
      }
      {/* Content end */}
    </Layout>
  )
})
