import React, { useState } from "react"
import { Text, ActionItem, ActionSheet, Divider, ActionSheetContent } from "../../../../components"
import { color, commonStyles } from "../../../../theme"
import { View } from "react-native"
import { FOLDER_IMG } from "../../../../common/mappings"
import { OwnershipAction } from "../../../../components/cipher/cipher-action/ownership-action"
import { RenameFolderModal } from "./rename-folder-modal"
import { FolderView } from "../../../../../core/models/view/folderView"
import { DeleteConfirmModal } from "../trash/delete-confirm-modal"
import { useStores } from "../../../../models"
import { useMixins } from "../../../../services/mixins"
import { CollectionView } from "../../../../../core/models/view/collectionView"


type Props = {
  isOpen?: boolean,
  onClose?: () => void,
  folder: FolderView | CollectionView,
  onLoadingChange?: Function
}


export const FolderAction = (props: Props) => {
  const { isOpen, onClose, folder, onLoadingChange } = props
  const { folderStore } = useStores()
  const { notify, translate, notifyApiError } = useMixins()

  const [showOwnershipAction, setShowOwnershipAction] = useState(false)
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  return (
    <View>
      {/* Modals / Actions */}

      <OwnershipAction
        isOpen={showOwnershipAction}
        onClose={() => setShowOwnershipAction(false)}
      />

      <RenameFolderModal
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        folder={folder}
      />

      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={async () => {
          onLoadingChange && onLoadingChange(true)
          const res = await folderStore.deleteFolder(folder.id)
          if (res.kind === 'ok') {
            notify('success', translate('folder.folder_deleted'))
          } else {
            notifyApiError(res)
          }
          onLoadingChange && onLoadingChange(false)
        }}
        title={translate('folder.delete_modal.title')}
        desc={translate('folder.delete_modal.desc')}
        btnText={translate('folder.delete_modal.btn')}
      />

      {/* Modals / Actions end */}

      <ActionSheet
        isOpen={isOpen}
        onClose={onClose}
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
              onClose()
              setTimeout(() => {
                setIsRenameOpen(true)
              }, 1500)
            }}
          />

          <ActionItem
            name={translate('folder.delete_folder')}
            icon="trash"
            textColor={color.error}
            action={() => {
              onClose()
              setTimeout(() => {
                setShowConfirmModal(true)
              }, 1500)
            }}
          />
        </ActionSheetContent>
      </ActionSheet>
    </View>
  )
}
