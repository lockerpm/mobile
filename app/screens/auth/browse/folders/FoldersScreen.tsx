/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import groupBy from 'lodash/groupBy'
import orderBy from 'lodash/orderBy'
import { useNavigation } from '@react-navigation/native'
import { SectionList, TouchableOpacity, View } from 'react-native'
import { NewFolderModal } from './NewFolderModal'
import { FolderAction } from './FolderAction'
import { CipherListHeader, EmptyCipherList, SortActionConfigModal } from 'app/components/ciphers'
import { Icon, ImageIcon, Screen, Text } from 'app/components/cores'
import { useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { useStores } from 'app/models'
import { FolderView } from 'core/models/view/folderView'
import { CollectionView } from 'core/models/view/collectionView'
import { TEAM_COLLECTION_EDITOR } from 'app/static/constants'
import { translate } from 'app/i18n'

const EMPTY = require('assets/images/emptyCipherList/folder-empty-img.png')

export const FoldersScreen = observer(function FoldersScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { getTeam } = useHelper()
  const { folderStore, collectionStore, user, uiStore, cipherStore } = useStores()

  const folders: FolderView[] = folderStore.folders

  type SectionType = {
    id: string
    title: string
    data: any[]
  }[]

  // ------------------- PARAMS ---------------------

  const [isSortOpen, setIsSortOpen] = useState(false)
  const [isActionOpen, setIsActionOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [sortList, setSortList] = useState({
    orderField: 'revisionDate',
    order: 'desc',
  })
  const [sortOption, setSortOption] = useState('last_updated')
  const [selectedFolder, setSelectedFolder] = useState<FolderView | CollectionView>(
    new FolderView()
  )
  const [isLoading, setIsLoading] = useState(false)
  const [sections, setSections] = useState<SectionType>([])

  // ------------------- METHODS ---------------------

  const getFilteredData = (items: any[], teamShared: boolean, editable: boolean) => {
    const filtered = items.filter((item: FolderView | CollectionView) => {
      if (searchText) {
        return item.name && item.name.toLowerCase().includes(searchText.toLowerCase())
      }
      return true
    })
    if (sortList) {
      const { orderField, order } = sortList
      const result =
        orderBy(
          filtered,
          [(f) => (orderField === 'name' ? f.name && f.name.toLowerCase() : f.revisionDate)],
          [order]
        ).map((i) => ({ ...i, teamShared, editable })) || []
      return result
    }
    return filtered
  }

  const loadSections = async () => {
    const filteredCollection = groupBy(collectionStore.collections, 'organizationId')
    const sharedFolders = []
    Object.keys(filteredCollection).forEach((id) => {
      const temp = getFilteredData(
        filteredCollection[id],
        true,
        TEAM_COLLECTION_EDITOR.includes(getTeam(user.teams, id).role) && !uiStore.isOffline
      )
      sharedFolders.push(...temp)
    })

    const data = [
      {
        id: 'folder',
        title: translate('common.me'),
        data: getFilteredData(folders, false, true),
      },
      {
        id: 'collection',
        title: translate('shares.shared_folder'),
        data: sharedFolders,
      },
    ]
    setSections(data)
  }

  // ------------------- EFFECTS ---------------------

  useEffect(() => {
    loadSections()
  }, [folderStore.lastUpdate, collectionStore.lastUpdate, cipherStore.lastSync])

  // ------------------- RENDER ---------------------

  return (
    <Screen
      safeAreaEdges={['bottom']}
      header={
        <CipherListHeader
          header={translate('common.folders')}
          openSort={() => setIsSortOpen(true)}
          openAdd={() => setIsAddOpen(true)}
          navigation={navigation}
          searchText={searchText}
          onSearch={setSearchText}
          isSelecting={false}
          setIsLoading={() => {
            //
          }}
        />
      }
    >
      <FolderAction
        isOpen={isActionOpen}
        onClose={() => setIsActionOpen(false)}
        folder={selectedFolder}
        onLoadingChange={setIsLoading}
      />

      <SortActionConfigModal
        byNameOnly
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        onSelect={(value: string, obj: { orderField: string; order: string }) => {
          setSortOption(value)
          setSortList(obj)
        }}
        value={sortOption}
      />

      <NewFolderModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />

      {!sections.length ? (
        <EmptyCipherList
          img={EMPTY}
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
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) =>
            section.data.length > 0 && (
              <Text
                preset="label"
                size="base"
                text={`${section.title} (${section.data.length})`}
                style={{
                  paddingHorizontal: 20,
                  paddingTop: 20,
                  backgroundColor: colors.background,
                }}
              />
            )
          }
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: 20 }}>
              <TouchableOpacity
                onPress={() => {
                  if (item.teamShared) {
                    navigation.navigate('folders__ciphers', {
                      collectionId: item.id,
                      organizationId: item.organizationId,
                    })
                  } else {
                    navigation.navigate('folders__ciphers', { folderId: item.id })
                  }
                }}
                style={{
                  borderBottomColor: colors.border,
                  borderBottomWidth: 0.5,
                  paddingVertical: 15,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ImageIcon icon={item.teamShared ? 'folder-share' : 'folder'} size={30} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Text
                        preset="bold"
                        text={item.name || translate('folder.unassigned')}
                        numberOfLines={2}
                      />

                      {[
                        ...folderStore.notSynchedFolders,
                        ...folderStore.notUpdatedFolders,
                      ].includes(item.id) && (
                        <View style={{ marginLeft: 10 }}>
                          <Icon icon="wifi-slash" size={22} />
                        </View>
                      )}
                    </View>

                    <Text
                      size="base"
                      preset="label"
                      text={
                        (item.cipherCount !== undefined ? `${item.cipherCount}` : '0') +
                        ' ' +
                        (item.cipherCount > 1
                          ? translate('common.items')
                          : translate('common.item'))
                      }
                    />
                  </View>

                  {
                    // TODO
                    // (!!item.id && item.editable) && (
                    !!item.id && (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedFolder(item)
                          setIsActionOpen(true)
                        }}
                        style={{
                          height: 35,
                          width: 40,
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                        }}
                      >
                        <Icon icon="dots-three" size={18} />
                      </TouchableOpacity>
                    )
                  }
                </View>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </Screen>
  )
})
