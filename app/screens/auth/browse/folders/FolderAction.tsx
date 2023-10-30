import React, { useEffect, useState } from "react"
import { Platform, View } from "react-native"
import { RenameFolderModal } from "./RenameFolderModal"
import { DeleteConfirmModal } from "../trash/DeleteConfirmModal"
import { AddUserShareFolderModal } from "./folderSharedUsersManagement/ShareUserModal"
import { useNavigation } from "@react-navigation/native"
import { ImageIcon, Text } from "app/components/cores"
import { FolderView } from "core/models/view/folderView"
import { CollectionView } from "core/models/view/collectionView"
import { useStores } from "app/models"
import { useCipherData, useFolder, useHelper } from "app/services/hook"
import { AccountRole, AccountRoleText } from "app/static/types"
import { GeneralApiProblem } from "app/services/api/apiProblem"
import { ActionItem, ActionSheet, LeaveShareModal } from "app/components/ciphers"
import { useTheme } from "app/services/context"

type Props = {
  isOpen?: boolean
  onClose?: () => void
  folder: FolderView | CollectionView
  onLoadingChange?: (val: boolean) => void
}

export const FolderAction = (props: Props) => {
  const { isOpen, onClose, folder, onLoadingChange } = props
  if (!folder) return null
  const navigation = useNavigation() as any
  const { cipherStore, user, uiStore } = useStores()
  const { colors } = useTheme()
  const { getTeam, notifyApiError, translate } = useHelper()
  const { deleteCollection, deleteFolder } = useCipherData()
  const { stopShareFolder } = useFolder()

  // @ts-ignore
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
    "rename" | "deleteConfirm" | "share" | "leaveConfirm" | null
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

    if (res.kind !== "ok") {
      // @ts-ignore
      notifyApiError(res)
    }
    onLoadingChange && onLoadingChange(false)
  }

  const handleActionSheetClose = () => {
    onClose()
    switch (nextModal) {
      case "rename":
        setIsRenameOpen(true)
        break
      case "deleteConfirm":
        setShowConfirmModal(true)
        break
      case "share":
        setShowShareModal(true)
        break
      case "leaveConfirm":
        setShowConfirmLeaveModal(true)
        break
    }
    setNextModal(null)
  }

  useEffect(() => {
    if (Platform.OS === "android" && !isOpen) {
      switch (nextModal) {
        case "rename":
          setIsRenameOpen(true)
          break
        case "deleteConfirm":
          setShowConfirmModal(true)
          break
        case "share":
          setShowShareModal(true)
          break
        case "leaveConfirm":
          setShowConfirmLeaveModal(true)
          break
      }
      setNextModal(null)
    }
  }, [isOpen, nextModal])
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
        title={translate("folder.delete_modal.title")}
        desc={translate("folder.delete_modal.desc")}
        btnText={translate("folder.delete_modal.btn")}
      />

      <ActionSheet
        isOpen={isOpen}
        onClose={handleActionSheetClose}
        header={
          <View style={{ width: "100%", paddingHorizontal: 20, marginBottom: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ImageIcon icon={isCollection ? "folder-share" : "folder"} size={30} />
              <View
                style={{
                  marginLeft: 10,
                  flex: 1,
                }}
              >
                <Text preset="bold" text={folder?.name} numberOfLines={2} />
              </View>
            </View>
          </View>
        }
      >
        {editable && (
          <>
            <ActionItem
              name={translate("common.rename")}
              icon="edit"
              action={() => {
                setNextModal("rename")
                onClose()
              }}
            />

            {isCollection ? (
              isOwner && (
                <ActionItem
                  name={translate("shares.share_folder.manage_user")}
                  icon="users-three"
                  action={() => {
                    navigation.navigate("shareFolder", { collectionId: folder?.id })
                    onClose()
                  }}
                />
              )
            ) : (
              <ActionItem
                isPremium={user.isFreePlan}
                name={translate("common.share")}
                icon="share"
                action={() => {
                  if (user.isFreePlan) {
                    navigation.navigate("payment")
                    return
                  }
                  setNextModal("share")
                  onClose()
                }}
              />
            )}
            {isOwner && isCollection && (
              <ActionItem
                name={translate("shares.stop_sharing")}
                icon="x-circle"
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
                name={translate("shares.leave")}
                icon="sign-out"
                color={colors.error}
                action={() => {
                  setNextModal("leaveConfirm")
                  onClose()
                }}
              />
            )}

            {isOwner && (
              <ActionItem
                name={translate("folder.delete_folder")}
                icon="trash"
                color={colors.error}
                action={() => {
                  setNextModal("deleteConfirm")
                  onClose()
                }}
              />
            )}
          </>
        )}

        {!editable && isShared && (
          <ActionItem
            disabled={uiStore.isOffline}
            name={translate("shares.leave")}
            icon="sign-out"
            color={colors.error}
            action={() => {
              setNextModal("leaveConfirm")
              onClose()
            }}
          />
        )}
      </ActionSheet>
    </View>
  )
}
