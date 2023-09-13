import React, { useState } from 'react'
import { Text, ActionItem, ActionSheet, Divider, ActionSheetContent } from '../../../../components'
import { color, commonStyles } from '../../../../theme'
import { View } from 'react-native'
import { FOLDER_IMG } from '../../../../common/mappings'
import { RenameFolderModal } from './rename-folder-modal'
import { FolderView } from '../../../../../core/models/view/folderView'
import { DeleteConfirmModal } from '../trash/delete-confirm-modal'
import { useMixins } from '../../../../services/mixins'
import { CollectionView } from '../../../../../core/models/view/collectionView'
import { GeneralApiProblem } from '../../../../services/api/apiProblem'
import { useCipherDataMixins } from '../../../../services/mixins/cipher/data'
import { AddUserShareFolderModal } from './folder-shared-users-management/share-user-modal'
import { useNavigation } from '@react-navigation/native'
import { useStores } from '../../../../models'
import { AccountRole, AccountRoleText } from '../../../../config/types'
import { useFolderMixins } from '../../../../services/mixins/folder'
import { LeaveShareModal } from '../../../../components/cipher/cipher-action/leave-share-modal'

type Props = {
  isOpen?: boolean
  onClose?: () => void
  folder: FolderView | CollectionView
  onLoadingChange?: Function
}

export const FolderAction = (props: Props) => {
  const { isOpen, onClose, folder, onLoadingChange } = props
  if (!folder) return null

  const navigation = useNavigation()
  const { cipherStore, user, uiStore } = useStores()

  const { translate, getTeam } = useMixins()
  const { deleteCollection, deleteFolder } = useCipherDataMixins()
  const { stopShareFolder } = useFolderMixins()

  const organizationId = folder && folder.organizationId
  const isCollection = !!organizationId

  // Computed
  const organizations = cipherStore.organizations
  const teamRole = getTeam(user.teams, organizationId).role
  const shareRole = getTeam(organizations, organizationId).type
  const isOwner = shareRole === AccountRole.OWNER
  const isShared = shareRole === AccountRole.MEMBER || shareRole === AccountRole.ADMIN
  const editable =
    !organizationId ||
    (teamRole && teamRole !== AccountRoleText.MEMBER) ||
    shareRole === AccountRole.ADMIN ||
    shareRole === AccountRole.OWNER

  // ---------------- PARAMS -----------------

  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showConfirmLeaveModal, setShowConfirmLeaveModal] = useState(false)
  const [nextModal, setNextModal] = useState<
    'rename' | 'deleteConfirm' | 'share' | 'leaveConfirm' | null
  >(null)
  const [showShareModal, setShowShareModal] = useState(false)

  // ---------------- METHODS -----------------

  const handleDelete = async () => {
    onLoadingChange && onLoadingChange(true)
    let res: { kind: string } | GeneralApiProblem

    // @ts-ignore
    if (!folder.organizationId) {
      res = await deleteFolder(folder.id)
    } else {
      // @ts-ignore
      res = await deleteCollection(folder)
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
      case 'share':
        setShowShareModal(true)
        break
      case 'leaveConfirm':
        setShowConfirmLeaveModal(true)
        break
    }
    setNextModal(null)
  }
  // ---------------- RENDER -----------------

  return (
    <View>
      {/* Modals / Actions */}
      <AddUserShareFolderModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false)
        }}
        folder={folder}
      />

      {isShared && (
        <LeaveShareModal
          isOpen={showConfirmLeaveModal}
          onClose={() => setShowConfirmLeaveModal(false)}
          organizationId={organizationId}
        />
      )}

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

      <ActionSheet isOpen={isOpen} onClose={handleActionSheetClose}>
        {/* Info */}
        <View style={{ width: '100%', paddingHorizontal: 20 }}>
          <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
            {isCollection ? (
              <FOLDER_IMG.share.svg height={30} />
            ) : (
              <FOLDER_IMG.normal.svg height={30} />
            )}
            <View
              style={{
                marginLeft: 10,
                flex: 1,
              }}
            >
              <Text preset="semibold" text={folder?.name} numberOfLines={2} />
            </View>
          </View>
        </View>
        {/* Info end */}

        <Divider style={{ marginTop: 10 }} />

        {editable && (
          <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
            <ActionItem
              name={translate('common.rename')}
              icon="edit"
              action={() => {
                setNextModal('rename')
                onClose()
              }}
            />

            {isCollection ? (
              isOwner && (
                <ActionItem
                  name={translate('shares.share_folder.manage_user')}
                  icon="users"
                  action={() => {
                    navigation.navigate('shareFolder', { collectionId: folder?.id })
                    onClose()
                  }}
                />
              )
            ) : (
              <ActionItem
                isPremium
                name={translate('common.share')}
                icon="share-square-o"
                action={() => {
                  setNextModal('share')
                  onClose()
                }}
              />
            )}
            {isOwner && isCollection && (
              <ActionItem
                name={translate('shares.stop_sharing')}
                icon="stop-circle"
                action={() => {
                  // @ts-ignore
                  stopShareFolder(folder)
                  onClose()
                }}
              />
            )}

            {isShared && (
              <ActionItem
                disabled={uiStore.isOffline}
                name={translate('shares.leave')}
                icon="sign-out"
                textColor={color.error}
                action={() => {
                  setNextModal('leaveConfirm')
                  onClose()
                }}
              />
            )}

            {isOwner && (
              <ActionItem
                name={translate('folder.delete_folder')}
                icon="trash"
                textColor={color.error}
                action={() => {
                  setNextModal('deleteConfirm')
                  onClose()
                }}
              />
            )}
          </ActionSheetContent>
        )}

        {!editable && isShared && (
          <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
            <ActionItem
              disabled={uiStore.isOffline}
              name={translate('shares.leave')}
              icon="sign-out"
              textColor={color.error}
              action={() => {
                setNextModal('leaveConfirm')
                onClose()
              }}
            />
          </ActionSheetContent>
        )}
      </ActionSheet>
    </View>
  )
}
