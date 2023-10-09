/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { TouchableOpacity, View } from 'react-native'
import { NewFolderModal } from '../NewFolderModal'
import { AppStackScreenProps } from 'app/navigators'
import { useStores } from 'app/models'
import { useFolder, useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { translate } from 'app/i18n'
import { Header, Icon, ImageIcon, Screen, Text } from 'app/components/cores'
import { AccountRole } from 'app/static/types'

export const FolderSelectScreen: FC<AppStackScreenProps<'folders__select'>> = observer((props) => {
  const navigation = props.navigation
  const route = props.route
  const { mode, initialId, cipherIds = [] } = route.params
  const { folderStore, cipherStore, collectionStore } = useStores()
  const { colors } = useTheme()
  const { notify, notifyApiError, getTeam } = useHelper()
  const { shareFolderAddMultipleItems } = useFolder()

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
        folderId: selectedFolder,
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
        collectionStore.collections.find((c) => c.id === selectedFolder),
        cipherIds
      )
      if (res.kind === 'ok') {
        notify('success', translate('folder.item_moved'))
      }
      setIsLoading(false)
    } else {
      cipherStore.setSelectedCollection(selectedFolder)
    }
    navigation.goBack()
  }

  const renderItem = (item, index, isCollection: boolean) => (
    <TouchableOpacity
      key={index}
      onPress={() => {
        setSelectedFolder(item.id)
        isSelectedCollection.current = isCollection
      }}
      style={{
        padding: 16,
        backgroundColor: colors.background,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ImageIcon icon={!isCollection ? 'folder' : 'folder-share'} size={30} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            marginLeft: 10,
          }}
        >
          <Text text={item.name} numberOfLines={2} />

          {[...folderStore.notSynchedFolders, ...folderStore.notUpdatedFolders].includes(
            item.id
          ) && (
              <View style={{ marginLeft: 10 }}>
                <Icon icon="wifi-slash" size={22} color={colors.title} />
              </View>
            )}
        </View>

        {selectedFolder === item.id && <Icon icon="check" size={18} color={colors.primary} />}
      </View>
    </TouchableOpacity>
  )

  // Render
  return (
    <Screen
      backgroundColor={colors.block}
      header={
        <Header
          title={
            mode === 'add' ? translate('folder.add_to_folder') : translate('folder.move_to_folder')
          }
          onLeftPress={() => navigation.goBack()}
          leftText={translate('common.cancel')}
          rightText={translate('common.save')}
          onRightPress={handleMove}
        />
      }
    >
      <NewFolderModal isOpen={showNewFolderModal} onClose={() => setShowNewFolderModal(false)} />

      <TouchableOpacity
        onPress={() => setSelectedFolder('unassigned')}
        style={{
          backgroundColor: colors.background,
          padding: 16,
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text tx={'folder.no_folder'} style={{ flex: 1 }} />

          {!selectedFolder && <Icon icon="check" size={18} color={colors.primary} />}
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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ImageIcon size={30} icon="folder-add" />

          <Text text={translate('folder.new_folder')} style={{ flex: 1, marginLeft: 10 }} />
          <Icon icon="caret-right" size={20} color={colors.title} />
        </View>
      </TouchableOpacity>

      {/* Other folders */}
      {folderStore.folders.filter((i) => i.id).map((item, index) => renderItem(item, index, false))}

      <View
        style={{
          backgroundColor: colors.background,
          marginVertical: 16,
        }}
      >
        {collectionStore.collections
          ?.filter((item) => {
            const shareRole = getTeam(organizations, item.organizationId).type
            return shareRole === AccountRole.OWNER
          })
          .map((item, index) => renderItem(item, index, true))}
      </View>
    </Screen>
  )
})
