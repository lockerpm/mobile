import React, { useState } from "react"
import { Text, ActionItem, ActionSheet, Divider, ActionSheetContent } from "../../../../components"
import { color, commonStyles } from "../../../../theme"
import { View } from "react-native"
import { FOLDER_IMG } from "../../../../common/mappings"
import { RenameFolderModal } from "./rename-folder-modal"
import { FolderView } from "../../../../../core/models/view/folderView"
import { DeleteConfirmModal } from "../trash/delete-confirm-modal"
import { useMixins } from "../../../../services/mixins"
import { CollectionView } from "../../../../../core/models/view/collectionView"
import { GeneralApiProblem } from "../../../../services/api/api-problem"
import { useCipherDataMixins } from "../../../../services/mixins/cipher/data"


type Props = {
  isOpen?: boolean,
  onClose?: () => void,
  folder: FolderView | CollectionView,
  onLoadingChange?: Function
}


export const FolderAction = (props: Props) => {
  const { isOpen, onClose, folder, onLoadingChange } = props
  const { translate } = useMixins()
  const { deleteCollection, deleteFolder } = useCipherDataMixins()

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
      res = await deleteFolder(folder.id)
    } else {
      // @ts-ignore
      res = await deleteCollection(folder.id, folder.organizationId)
    }

    onLoadingChange && onLoadingChange(false)
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
        {/* Info */}
        <View style={{ width: '100%', paddingHorizontal: 20 }}>
          <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
            {
              folder instanceof CollectionView ? (
                <FOLDER_IMG.share.svg height={30} />
              ) : (
                <FOLDER_IMG.normal.svg height={30} />
              )
            }
            <View style={{
              marginLeft: 10,
              flex: 1
            }}>
              <Text
                preset="semibold"
                text={folder.name}
                numberOfLines={2}
              />
            </View>
          </View>
        </View>
        {/* Info end */}

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
            name={translate('common.share')}
            icon="share-square-o"
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
