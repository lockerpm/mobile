import React, { useState } from "react"
import { TouchableOpacity, View } from "react-native"
import { observer } from "mobx-react-lite"
import { commonStyles, fontSize } from "../../../theme"
import { useStores } from "../../../models"
import { ActionItem } from "./action-item"
import { useMixins } from "../../../services/mixins"
import { DeleteConfirmModal } from "../../../screens/auth/browse/trash/delete-confirm-modal"
import { Text } from "../../text/text"
import { AutoImage as Image } from "../../auto-image/auto-image"
import { ActionSheet } from "../../action-sheet/action-sheet"
import { ActionSheetContent } from "../../action-sheet"
import { Divider } from "../../divider/divider"
import { CipherView } from "../../../../core/models/view"
import { ChangeTeamFolderModal } from "./change-team-folder-modal"
import { useCipherDataMixins } from "../../../services/mixins/cipher/data"
import { AccountRole, AccountRoleText, PlanType } from "../../../config/types"
import { LeaveShareModal } from "./leave-share-modal"
import { useCipherHelpersMixins } from "../../../services/mixins/cipher/helpers"
import { CipherType } from "../../../../core/enums"

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
export const CipherAction = observer((props: CipherActionProps) => {
  const { navigation, isOpen, onClose, children, isEmergencyView } = props

  const [showConfirmTrashModal, setShowConfirmTrashModal] = useState(false)
  const [showConfirmLeaveModal, setShowConfirmLeaveModal] = useState(false)

  const [showChangeTeamFolderModal, setShowChangeTeamFolderModal] = useState(false)
  const [nextModal, setNextModal] = useState<
    "changeTeamFolder" | "share" | "trashConfirm" | "leaveConfirm" | null
  >(null)

  // const [showShareModal, setShowShareModal] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)

  const { getRouteName, translate, getTeam, color, goPremium } = useMixins()
  const { toTrashCiphers } = useCipherDataMixins()
  const { getCipherDescription, getCipherInfo } = useCipherHelpersMixins()
  const { cipherStore, user, uiStore } = useStores()
  const selectedCipher: CipherView = { ...cipherStore.cipherView }
  selectedCipher.revisionDate = null
  // Computed
  const premiumLock = user.isFreePlan
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

      {/* <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} /> */}

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

      {/* Modals end */}

      {/* Actionsheet */}
      <ActionSheet isOpen={isOpen} onClose={handleActionSheetClose}>
        {/* Cipher info */}
        <View style={{ width: "100%", paddingHorizontal: 20 }}>
          <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
            {cipherMapper.svg ? (
              <cipherMapper.svg height={40} width={40} />
            ) : (
              <Image
                source={cipherMapper.img}
                backupSource={cipherMapper.backup}
                style={{ height: 40, width: 40, borderRadius: 8 }}
              />
            )}
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text preset="semibold" text={selectedCipher.name} numberOfLines={2} />
              {!!getCipherDescription(selectedCipher) && (
                <Text
                  text={getCipherDescription(selectedCipher)}
                  style={{ fontSize: fontSize.small }}
                />
              )}
            </View>
          </View>
        </View>
        {/* Cipher info end */}

        <Divider style={{ marginTop: 10 }} />

        <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
          {children}

          <Divider style={{ marginVertical: 5 }} />

          <ActionItem
            disabled={uiStore.isOffline && !!selectedCipher.organizationId}
            name={translate("common.details")}
            icon="list-alt"
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
                  icon="clone"
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
                  icon="folder-o"
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

              {/* TODO: team feature -> temporary disabled */}
              {/* {
                  selectedCipher.organizationId && (
                    <ActionItem
                      disabled={uiStore.isOffline}
                      name={translate('common.team_folders')}
                      icon="user-o"
                      action={() => {
                        setNextModal('changeTeamFolder')
                        onClose()
                      }}
                    />
                  )
                } */}

              <Divider style={{ marginVertical: 5 }} />

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
                  onClose={onClose}
                  disabled={uiStore.isOffline}
                  name={translate("common.share")}
                  icon="share-square-o"
                  action={() => {
                    setNextModal("share")
                    onClose()
                  }}
                />
              )}

              {!lockerMasterPassword && !isInFolderShare && (
                <ActionItem
                  disabled={uiStore.isOffline && !!selectedCipher.organizationId}
                  name={translate("trash.to_trash")}
                  icon="trash"
                  textColor={color.error}
                  action={() => {
                    setNextModal("trashConfirm")
                    onClose()
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
              textColor={color.error}
              action={() => {
                setNextModal("leaveConfirm")
                onClose()
              }}
            />
          )}
        </ActionSheetContent>
      </ActionSheet>

      {/** share option */}
      <ActionSheet
        isOpen={showShareOptions}
        onClose={() => setShowShareOptions(false)}
        style={{ paddingHorizontal: 16 }}
      >
        <Text
          preset="bold"
          text={translate("quick_shares.share_option.title")}
          style={{ fontSize: 20 }}
        />
        <ActionSheetContent contentContainerStyle={{ paddingVertical: 5, paddingBottom: 16 }}>
          <TouchableOpacity
            onPress={() => {
              setShowShareOptions(false)
              if (premiumLock) {
                goPremium()
              } else {
                navigation.navigate("normal_shares", { ciphers: [selectedCipher] })
              }
      
            }}
          >
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 14,
            }}>
              <Text
                preset="semibold"
                text={translate("quick_shares.share_option.normal.tl")}
                style={{
                  marginBottom: 4,
                }}
              />
              {premiumLock && (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 2,
                    backgroundColor: color.textBlack,
                    borderRadius: 3,
                    marginLeft: 10,
                  }}
                >
                  <Text
                    text="PREMIUM"
                    style={{
                      fontWeight: "bold",
                      color: color.background,
                      fontSize: fontSize.mini,
                    }}
                  />
                </View>
              )}
            </View>
     
            <Text text={translate("quick_shares.share_option.normal.dec")} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setShowShareOptions(false)
              navigation.navigate("quick_shares", { cipher: selectedCipher })
            }}
          >
            <Text
              preset="semibold"
              text={translate("quick_shares.share_option.quick.tl")}
              style={{
                marginVertical: 24,
                marginBottom: 4,
              }}
            />
            <Text text={translate("quick_shares.share_option.quick.dec")} />
          </TouchableOpacity>
        </ActionSheetContent>
      </ActionSheet>
      {/* Actionsheet end */}
    </View>
  )
})
