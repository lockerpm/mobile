import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import find from 'lodash/find'
import { CipherList, Layout, BrowseItemEmptyContent, BrowseItemHeader } from "../../../../../components"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { SortAction } from "../../../home/all-item/sort-action"
import { AddAction } from "../../../home/all-item/add-action"
import { useStores } from "../../../../../models"
import { FolderView } from "../../../../../../core/models/view/folderView"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"

type FolderCiphersScreenProp = RouteProp<PrimaryParamList, 'folders__ciphers'>;

export const FolderCiphersScreen = observer(function FolderCiphersScreen() {
  const navigation = useNavigation()
  const route = useRoute<FolderCiphersScreenProp>()
  const { folderId } = route.params
  const { folderStore } = useStores()
  const folders: FolderView[] = folderStore.folders

  // Params
  const [isLoading, setIsLoading] = useState(true)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [sortList, setSortList] = useState({
    orderField: 'name',
    order: 'asc'
  })
  const [sortOption, setSortOption] = useState('az')

  // Computed
  const folder = (() => {
    return find(folders, e => e.id === folderId) || {}
  })()


  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <BrowseItemHeader
          header={folder.name || 'Unassigned'}
          openSort={() => setIsSortOpen(true)}
          openAdd={() => setIsAddOpen(true)}
          navigation={navigation}
          onSearch={setSearchText}
        />
      )}
      borderBottom
      noScroll
    >
      <SortAction 
        isOpen={isSortOpen} 
        onClose={() => setIsSortOpen(false)}
        onSelect={(value: string, obj: { orderField: string, order: string }) => {
          setSortOption(value)
          setSortList(obj)
        }}
        value={sortOption}
      />
      
      <AddAction 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)}
        navigation={navigation}
        defaultFolder={folder.id}
      />

      <CipherList
        navigation={navigation}
        onLoadingChange={setIsLoading}
        searchText={searchText}
        sortList={sortList}
        folderId={folderId}
        emptyContent={(
          <BrowseItemEmptyContent
            img={require('../../../home/all-item/empty-img.png')}
            title="Add your first item"
            desc="Create your first item to start building your vault"
            buttonText="Add Item"
            addItem={() => {
              setIsAddOpen(true)
            }}
          />
        )}
      />
    </Layout>
  )
})
