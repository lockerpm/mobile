import React, { useState } from "react"
import { Text, AutoImage as Image, ActionItem, ActionSheet, Divider, ActionSheetContent } from "../../../../components"
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
import { translate } from "../../../../i18n"


type Props = {
  isOpen?: boolean,
  onClose?: () => void,
  folder: FolderView | CollectionView,
  onLoadingChange?: Function
}


export const FolderAction = (props: Props) => {
  const { isOpen, onClose, folder, onLoadingChange } = props
  const { folderStore } = useStores()
  const { notify } = useMixins()

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
            notify('error', translate('error.something_went_wrong'))
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
            <Image
              source={folder instanceof CollectionView ? FOLDER_IMG.share.img : FOLDER_IMG.normal.img}
              style={{ height: 30, marginRight: 10 }}
            />
            <View>
              <Text
                preset="semibold"
                text={folder.name}
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
              }, 100)
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
              }, 100)
            }}
          />
        </ActionSheetContent>
      </ActionSheet>
    </View>
  )
}
