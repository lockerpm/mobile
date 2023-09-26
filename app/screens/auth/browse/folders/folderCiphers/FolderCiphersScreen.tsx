import React, { FC, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import find from 'lodash/find'
import { BackHandler } from 'react-native'
import {
  AddCipherActionModal,
  CipherList,
  CipherListHeader,
  EmptyCipherList,
  SortActionConfigModal,
} from 'app/components-v2/ciphers'
import { AppStackScreenProps } from 'app/navigators'
import { useStores } from 'app/models'
import { FolderView } from 'core/models/view/folderView'
import { CollectionView } from 'core/models/view/collectionView'
import { MAX_CIPHER_SELECTION, TEAM_CIPHER_EDITOR } from 'app/static/constants'
import { useHelper } from 'app/services/hook'
import { AccountRole } from 'app/static/types'
import { Screen } from 'app/components-v2/cores'
import { translate } from 'app/i18n'

const HOME_EMPTY_CIPHER = require('assets/images/emptyCipherList/home-empty-cipher.png')

export const FolderCiphersScreen: FC<AppStackScreenProps<'folders__ciphers'>> = observer(
  (props) => {
    const navigation = props.navigation
    const route = props.route
    const { folderId, collectionId, organizationId } = route.params
    const { folderStore, collectionStore, user, uiStore, cipherStore } = useStores()
    const folders: FolderView[] = folderStore.folders
    const collections: CollectionView[] = collectionStore.collections

    const { getTeam } = useHelper()

    // Params
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isLoading, setIsLoading] = useState(true)
    const [isSortOpen, setIsSortOpen] = useState(false)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [sortList, setSortList] = useState({
      orderField: 'revisionDate',
      order: 'desc',
    })
    const [sortOption, setSortOption] = useState('last_updated')
    const [selectedItems, setSelectedItems] = useState([])
    const [isSelecting, setIsSelecting] = useState(false)
    const [allItems, setAllItems] = useState([])

    // Computed
    const folder = (() => {
      return (
        find(folders, (e) => e.id === folderId) || find(collections, (e) => e.id === collectionId)
      )
    })()

    const hasAddFolderPermission =
      !collectionId || TEAM_CIPHER_EDITOR.includes(getTeam(user.teams, folder?.organizationId).role)

    const organizations = cipherStore.organizations
    const hasAddCollectionPermission =
      getTeam(organizations, organizationId).type === AccountRole.OWNER
    const isSharedFolder = !!collectionId

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
          setSortOption('most_relevant')
        }
      } else {
        setSortList({
          orderField: 'revisionDate',
          order: 'desc',
        })
        setSortOption('last_updated')
      }
    }, [searchText])

    // Render
    return (
      <Screen
        header={
          <CipherListHeader
            header={folder?.name || translate('folder.unassigned')}
            openSort={() => setIsSortOpen(true)}
            openAdd={
              hasAddFolderPermission || hasAddCollectionPermission
                ? () => setIsAddOpen(true)
                : undefined
            }
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
        }
      >
        <SortActionConfigModal
          isOpen={isSortOpen}
          onClose={() => setIsSortOpen(false)}
          onSelect={(value: string, obj: { orderField: string; order: string }) => {
            setSortOption(value)
            setSortList(obj)
          }}
          value={sortOption}
        />

        <AddCipherActionModal
          collection={isSharedFolder ? folder : undefined}
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
          emptyContent={
            <EmptyCipherList
              img={HOME_EMPTY_CIPHER}
              imgStyle={{
                height: 55,
                width: 120,
              }}
              title={translate('all_items.empty.title')}
              desc={translate('all_items.empty.desc')}
              buttonText={translate('all_items.empty.btn')}
              addItem={
                hasAddFolderPermission || hasAddCollectionPermission
                  ? () => {
                      setIsAddOpen(true)
                    }
                  : undefined
              }
            />
          }
        />
      </Screen>
    )
  }
)
