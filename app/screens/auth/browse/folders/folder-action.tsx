import React, { useState } from "react"
import { Text, ActionItem, ActionSheet, Divider, ActionSheetContent } from "../../../../components"
import { color, commonStyles } from "../../../../theme"
import { View } from "react-native"
import { FOLDER_IMG } from "../../../../common/mappings"
import { RenameFolderModal } from "./rename-folder-modal"
import { FolderView } from "../../../../../core/models/view/folderView"
import { DeleteConfirmModal } from "../trash/delete-confirm-modal"
import { useStores } from "../../../../models"
import { useMixins } from "../../../../services/mixins"
import { CollectionView } from "../../../../../core/models/view/collectionView"
import { GeneralApiProblem } from "../../../../services/api/api-problem"
import { useCoreService } from "../../../../services/core-service"


type Props = {
  isOpen?: boolean,
  onClose?: () => void,
  folder: FolderView | CollectionView,
  onLoadingChange?: Function
}


export const FolderAction = (props: Props) => {
  const { isOpen, onClose, folder, onLoadingChange } = props
  const { folderStore, collectionStore, uiStore, cipherStore } = useStores()
  const { notify, translate, notifyApiError, reloadCache } = useMixins()
  const { userService, storageService } = useCoreService()

  // ---------------- PARAMS -----------------

  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [nextModal, setNextModal] = useState<'rename' | 'deleteConfirm' | null>(null)


  // ---------------- METHODS -----------------

  const handleDelete = async () => {
    onLoadingChange && onLoadingChange(true)
    let res: { kind: string } | GeneralApiProblem

    // @ts-ignore
    if (!folder.organizationId) {
      if (uiStore.isOffline) {
        await _offlineDeletePersonalFolder(folder.id)
        res = { kind: 'ok' }
      } else {
        res = await folderStore.deleteFolder(folder.id)
      }
    } else {
      // @ts-ignore
      res = await collectionStore.deleteCollection(folder.id, folder.organizationId)
    }

    if (res.kind === 'ok') {
      notify(
        'success', translate('folder.folder_deleted') 
        + (uiStore.isOffline ? ` ${translate('success.will_sync_when_online')}` : '')
      )
    } else {
      // @ts-ignore
      notifyApiError(res)
    }
    onLoadingChange && onLoadingChange(false)
  }

  const _offlineDeletePersonalFolder = async (id: string) => {
    const userId = await userService.getUserId()

    // Clear folder
    let key = `folders_${userId}`
    let res = await storageService.get(key)
    delete res[id]
    await storageService.save(key, res)
    folderStore.removeNotSync(id)

    // Update ciphers
    key = `ciphers_${userId}`
    res = await storageService.get(key)
    Object.keys(res).forEach((cipherId) => {
      if (res[cipherId].folderId === id) {
        res[cipherId].folderId = null
        res[cipherId].deletedDate = new Date().toISOString()
        cipherStore.addNotSync(cipherId)
      }
    })
    await storageService.save(key, res)
    
    await reloadCache()
  }

  const handleActionSheetClose = () => {
    onClose()
    switch (nextModal) {
      case 'rename':
        setIsRenameOpen(true)
        break
      case 'deleteConfirm':
        setShowConfirmModal(true)
        break
    }
    setNextModal(null)
  }
  
  // ---------------- RENDER -----------------

  return (
    <View>
      {/* Modals / Actions */}

      <RenameFolderModal
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        folder={folder}
      />

      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title={translate('folder.delete_modal.title')}
        desc={translate('folder.delete_modal.desc')}
        btnText={translate('folder.delete_modal.btn')}
      />

      {/* Modals / Actions end */}

      <ActionSheet
        isOpen={isOpen}
        onClose={handleActionSheetClose}
      >
        <View style={{ width: '100%', paddingHorizontal: 20 }}>
          <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
            {
              folder instanceof CollectionView ? (
                <FOLDER_IMG.share.svg height={30} />
              ) : (
                <FOLDER_IMG.normal.svg height={30} />
              )
            }
            <View>
              <Text
                preset="semibold"
                text={folder.name}
                style={{ marginLeft: 10 }}
              />
            </View>
          </View>
        </View>

        <Divider style={{ marginTop: 10 }} />

        <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
          <ActionItem
            name={translate('common.rename')}
            icon="edit"
            action={() => {
              setNextModal('rename')
              onClose()
            }}
          />

          <ActionItem
            name={translate('folder.delete_folder')}
            icon="trash"
            textColor={color.error}
            action={() => {
              setNextModal('deleteConfirm')
              onClose()
            }}
          />
        </ActionSheetContent>
      </ActionSheet>
    </View>
  )
}
