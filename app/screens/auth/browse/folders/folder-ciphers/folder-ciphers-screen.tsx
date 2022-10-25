import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import find from 'lodash/find'
import { CipherList, Layout, BrowseItemEmptyContent, BrowseItemHeader } from "../../../../../components"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { SortAction } from "../../../home/all-item/sort-action"
import { AddAction } from "../../../home/all-item/add-action"
import { useStores } from "../../../../../models"
import { FolderView } from "../../../../../../core/models/view/folderView"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { useMixins } from "../../../../../services/mixins"
import { CollectionView } from "../../../../../../core/models/view/collectionView"
import { MAX_CIPHER_SELECTION, TEAM_CIPHER_EDITOR } from "../../../../../config/constants"
import { BackHandler } from "react-native"

type FolderCiphersScreenProp = RouteProp<PrimaryParamList, 'folders__ciphers'>;

export const FolderCiphersScreen = observer(function FolderCiphersScreen() {
  const navigation = useNavigation()
  const route = useRoute<FolderCiphersScreenProp>()
  const { folderId, collectionId, organizationId } = route.params
  const { folderStore, collectionStore, user, uiStore } = useStores()
  const folders: FolderView[] = folderStore.folders
  const collections: CollectionView[] = collectionStore.collections
  const { translate, getTeam } = useMixins()

  // Params
  const [isLoading, setIsLoading] = useState(true)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [sortList, setSortList] = useState({
    orderField: 'revisionDate',
    order: 'desc'
  })
  const [sortOption, setSortOption] = useState('last_updated')
  const [selectedItems, setSelectedItems] = useState([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [allItems, setAllItems] = useState([])

  // Computed
  const folder = (() => {
    return find(folders, e => e.id === folderId) || find(collections, e => e.id === collectionId)
  })()

  const hasAddPermission = !collectionId || TEAM_CIPHER_EDITOR.includes(getTeam(user.teams, folder.organizationId).role)

  // Close select before leave
  useEffect(() => {
    uiStore.setIsSelecting(isSelecting)
    const checkSelectBeforeLeaving = () => {
      if (isSelecting) {
        setIsSelecting(false)
        setSelectedItems([])
        return true
      }
      return false
    }
    BackHandler.addEventListener('hardwareBackPress', checkSelectBeforeLeaving)
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', checkSelectBeforeLeaving)
    }
  }, [isSelecting])


  useEffect(() => {
    // set Most relevant by defalt when users search
    if (searchText) {
      if (searchText.trim().length === 1) {
        setSortList(null)
        setSortOption("most_relevant")
      }
    } else {
      setSortList({
        orderField: 'revisionDate',
        order: 'desc'
      })
      setSortOption("last_updated")
    }
  }, [searchText]);

  // Render
  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <BrowseItemHeader
          header={folder.name || translate('folder.unassigned')}
          openSort={() => setIsSortOpen(true)}
          openAdd={hasAddPermission ? () => setIsAddOpen(true) : undefined}
          navigation={navigation}
          searchText={searchText}
          onSearch={setSearchText}
          isSelecting={isSelecting}
          setIsSelecting={setIsSelecting}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          setIsLoading={setIsLoading}
          toggleSelectAll={() => {
            const maxLength = Math.min(allItems.length, MAX_CIPHER_SELECTION)
            if (selectedItems.length < maxLength) {
              setSelectedItems(allItems.slice(0, maxLength))
            } else {
              setSelectedItems([])
            }
          }}
        />
      )}
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
        collectionId={collectionId}
        organizationId={organizationId}
        isSelecting={isSelecting}
        setIsSelecting={setIsSelecting}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        setAllItems={setAllItems}
        emptyContent={(
          <BrowseItemEmptyContent
            img={require('../../../home/all-item/empty-img.png')}
            imgStyle={{
              height: 55,
              width: 120
            }}
            title={translate('all_items.empty.title')}
            desc={translate('all_items.empty.desc')}
            buttonText={translate('all_items.empty.btn')}
            addItem={hasAddPermission ? () => {
              setIsAddOpen(true)
            } : undefined}
          />
        )}
      />
    </Layout>
  )
})
