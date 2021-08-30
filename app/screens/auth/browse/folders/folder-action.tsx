import React, { useState } from "react"
import { Actionsheet, Divider } from "native-base"
import { Text, AutoImage as Image, ActionItem } from "../../../../components"
import { color, commonStyles } from "../../../../theme"
import { View, ScrollView } from "react-native"
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
  onClose?: Function,
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
          onLoadingChange(true)
          const res = await folderStore.deleteFolder(folder.id)
          if (res.kind === 'ok') {
            notify('success', '', 'Folder deleted')
          } else {
            notify('error', '', 'Something went wrong')
          }
          onLoadingChange(false)
        }}
        title="Delete folder"
        desc="After folder deleted, all items will be moved to trash. Are you sure you want to delete the folder?"
        btnText="Ok"
      />

      {/* Modals / Actions end */}

      <Actionsheet
        isOpen={isOpen}
        onClose={onClose}
      >
        <Actionsheet.Content>
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

          <Divider borderColor={color.line} marginBottom={1} marginTop={5} />

          <ScrollView
            style={{ width: '100%' }}
          >
            <ActionItem
              name="Rename"
              icon="edit"
              action={() => {
                onClose()
                setTimeout(() => {
                  setIsRenameOpen(true)
                }, 100)
              }}
            />

            <ActionItem
              name="Delete Folder"
              icon="trash"
              textColor={color.error}
              action={() => {
                onClose()
                setTimeout(() => {
                  setShowConfirmModal(true)
                }, 100)
              }}
            />
          </ScrollView>
        </Actionsheet.Content>
      </Actionsheet>
    </View>
  )
}