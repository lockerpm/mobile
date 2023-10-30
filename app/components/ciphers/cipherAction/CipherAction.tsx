import React, { useEffect, useState } from "react"
import { TouchableOpacity, View, Image, Platform } from "react-native"
import { DeleteConfirmModal } from "../../../screens/auth/browse/trash/DeleteConfirmModal"
import { LeaveShareModal } from "./LeaveShareModal"
import { useCipherData, useCipherHelper, useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"
import { useStores } from "app/models"
import { CipherView } from "core/models/view"
import { CipherType } from "core/enums"
import { AccountRole, AccountRoleText } from "app/static/types"
import { ChangeTeamFolderModal } from "./ChangeTeamFolderModal"
import { ActionSheet } from "../actionsSheet/ActionSheet"
import { Text } from "../../cores"
import { ActionItem } from "../actionsSheet/ActionSheetItem"

export interface CipherActionProps {
  children?: React.ReactNode
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  onLoadingChange?: (val: boolean) => void
  isEmergencyView?: boolean
}

/**
 * Describe your component here
 */
export const CipherAction = (props: CipherActionProps) => {
  const { navigation, isOpen, onClose, children, isEmergencyView } = props

  const [showConfirmTrashModal, setShowConfirmTrashModal] = useState(false)
  const [showConfirmLeaveModal, setShowConfirmLeaveModal] = useState(false)

  const [showChangeTeamFolderModal, setShowChangeTeamFolderModal] = useState(false)
  const [nextModal, setNextModal] = useState<
    "changeTeamFolder" | "share" | "trashConfirm" | "leaveConfirm" | null
  >(null)

  const [showShareOptions, setShowShareOptions] = useState(false)

  const { colors } = useTheme()
  const { getRouteName, getTeam, translate } = useHelper()
  const { toTrashCiphers } = useCipherData()
  const { getCipherDescription, getCipherInfo } = useCipherHelper()
  const { cipherStore, user, uiStore } = useStores()
  const selectedCipher: CipherView = { ...cipherStore.cipherView }
  selectedCipher.revisionDate = null

  // ------------------------------COMPUTED-------------------------------------
  const lockerMasterPassword = selectedCipher.type === CipherType.MasterPassword
  const emergencyView = isEmergencyView === undefined ? false : isEmergencyView
  const organizations = cipherStore.organizations
  const teamRole = getTeam(user.teams, selectedCipher.organizationId).role
  const shareRole = getTeam(organizations, selectedCipher.organizationId).type

  const isShared = shareRole === AccountRole.MEMBER || shareRole === AccountRole.ADMIN
  const isInFolderShare = selectedCipher.collectionIds?.length > 0
  // const isOwner = shareRole === AccountRole.ADMIN
  const editable =
    !selectedCipher.organizationId ||
    (teamRole && teamRole !== AccountRoleText.MEMBER) ||
    shareRole === AccountRole.ADMIN ||
    shareRole === AccountRole.OWNER

  const cipherMapper = (() => {
    const cipherInfo = getCipherInfo(selectedCipher)
    return cipherInfo
  })()

  // Methods

  const handleDelete = async () => {
    const res = await toTrashCiphers([selectedCipher.id])
    if (res.kind === "ok") {
      const routeName = await getRouteName()
      if (routeName.endsWith("__info")) {
        navigation.goBack()
      }
    }
  }

  const handleActionSheetClose = () => {
    onClose()
    switch (nextModal) {
      case "changeTeamFolder":
        setShowChangeTeamFolderModal(true)
        break
      case "share":
        setShowShareOptions(true)
        break
      case "trashConfirm":
        setShowConfirmTrashModal(true)
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
        case "changeTeamFolder":
          setShowChangeTeamFolderModal(true)
          break
        case "share":
          setShowShareOptions(true)
          break
        case "trashConfirm":
          setShowConfirmTrashModal(true)
          break
        case "leaveConfirm":
          setShowConfirmLeaveModal(true)
          break
      }
      setNextModal(null)
    }
  }, [isOpen, nextModal])

  // Render

  return (
    <View>
      {/* Modals */}
      <DeleteConfirmModal
        isOpen={showConfirmTrashModal}
        onClose={() => setShowConfirmTrashModal(false)}
        onConfirm={handleDelete}
        title={translate("trash.to_trash")}
        desc={translate("trash.to_trash_desc")}
        btnText="OK"
      />

      <ChangeTeamFolderModal
        isOpen={showChangeTeamFolderModal}
        onClose={() => setShowChangeTeamFolderModal(false)}
      />

      {isShared && (
        <LeaveShareModal
          isOpen={showConfirmLeaveModal}
          onClose={() => setShowConfirmLeaveModal(false)}
          cipherId={selectedCipher.id}
          organizationId={selectedCipher.organizationId}
        />
      )}

      {/* Actionsheet */}
      <ActionSheet
        isOpen={isOpen}
        onClose={handleActionSheetClose}
        header={
          <View style={{ width: "100%", paddingHorizontal: 20, marginBottom: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={cipherMapper.img}
                resizeMode="contain"
                style={{ height: 40, width: 40, borderRadius: 8 }}
              />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text preset="bold" text={selectedCipher.name} numberOfLines={2} />
                {!!getCipherDescription(selectedCipher) && (
                  <Text
                    preset="label"
                    text={getCipherDescription(selectedCipher)}
                    style={{ fontSize: 14 }}
                  />
                )}
              </View>
            </View>
          </View>
        }
      >
        {children}
        <ActionItem
          disabled={uiStore.isOffline && !!selectedCipher.organizationId}
          name={translate("common.details")}
          icon="list-bullets"
          action={() => {
            onClose()
            navigation.navigate(`${cipherMapper.path}__info`)
          }}
        />

        {editable && !emergencyView && (
          <View>
            {!lockerMasterPassword && (
              <ActionItem
                name={translate("common.clone")}
                icon="copy"
                action={() => {
                  onClose()
                  navigation.navigate(`${cipherMapper.path}__edit`, { mode: "clone" })
                }}
              />
            )}

            {!isInFolderShare && !lockerMasterPassword && (
              <ActionItem
                disabled={uiStore.isOffline && !!selectedCipher.organizationId}
                name={translate("folder.move_to_folder")}
                icon="folder-simple"
                action={() => {
                  onClose()
                  navigation.navigate("folders__select", {
                    mode: "move",
                    initialId: selectedCipher.folderId,
                    cipherIds: [selectedCipher.id],
                  })
                }}
              />
            )}

            {!lockerMasterPassword && (
              <ActionItem
                disabled={uiStore.isOffline && !!selectedCipher.organizationId}
                name={translate("common.edit")}
                icon="edit"
                action={() => {
                  onClose()
                  navigation.navigate(`${cipherMapper.path}__edit`, { mode: "edit" })
                }}
              />
            )}

            {!lockerMasterPassword && !isInFolderShare && !isShared && (
              <ActionItem
                disabled={uiStore.isOffline}
                name={translate("common.share")}
                icon="share"
                action={() => {
                  onClose()
                  setTimeout(() => {
                    setNextModal("share")
                  }, 150)
                }}
              />
            )}

            {!lockerMasterPassword && !isInFolderShare && (
              <ActionItem
                disabled={uiStore.isOffline && !!selectedCipher.organizationId}
                name={translate("trash.to_trash")}
                icon="trash"
                color={colors.error}
                action={() => {
                  onClose()
                  setNextModal("trashConfirm")
                }}
              />
            )}
          </View>
        )}

        {isShared && !isInFolderShare && (
          <ActionItem
            disabled={uiStore.isOffline}
            name={translate("shares.leave")}
            icon="sign-out"
            color={colors.error}
            action={() => {
              onClose()
              setNextModal("leaveConfirm")
            }}
          />
        )}
      </ActionSheet>

      <ActionSheet
        isOpen={showShareOptions}
        onClose={() => setShowShareOptions(false)}
        header={
          <Text
            preset="bold"
            text={translate("quick_shares.share_option.title")}
            style={{ fontSize: 20, padding: 16 }}
          />
        }
      >
        <TouchableOpacity
          onPress={() => {
            setShowShareOptions(false)
            navigation.navigate("normal_shares", { ciphers: [selectedCipher] })
          }}
          style={{
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              preset="bold"
              text={translate("quick_shares.share_option.normal.tl")}
              style={{
                marginBottom: 4,
              }}
            />
          </View>

          <Text preset="label" text={translate("quick_shares.share_option.normal.dec")} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setShowShareOptions(false)
            navigation.navigate("quick_shares", { cipher: selectedCipher })
          }}
          style={{
            paddingHorizontal: 20,
          }}
        >
          <Text
            preset="bold"
            text={translate("quick_shares.share_option.quick.tl")}
            style={{
              marginVertical: 24,
              marginBottom: 4,
            }}
          />
          <Text preset="label" text={translate("quick_shares.share_option.quick.dec")} />
        </TouchableOpacity>
      </ActionSheet>
    </View>
  )
}
