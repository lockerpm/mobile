import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { commonStyles, fontSize } from "../../../theme"
import { useStores } from "../../../models"
import { BROWSE_ITEMS } from "../../../common/mappings"
import { ActionItem } from "./action-item"
import { CipherType } from "../../../../core/enums"
import { useMixins } from "../../../services/mixins"
import { DeleteConfirmModal } from "../../../screens/auth/browse/trash/delete-confirm-modal"
import { Text } from "../../text/text"
import { AutoImage as Image } from "../../auto-image/auto-image"
import { ActionSheet } from "../../action-sheet/action-sheet"
import { ActionSheetContent } from "../../action-sheet"
import { Divider } from "../../divider/divider"
import { CipherView } from "../../../../core/models/view"
import { ShareModal } from "./share-modal"
import { ChangeTeamFolderModal } from "./change-team-folder-modal"
import { useCipherDataMixins } from "../../../services/mixins/cipher/data"
import { AccountRole, AccountRoleText } from "../../../config/types"
import { LeaveShareModal } from "./leave-share-modal"
import { useCipherHelpersMixins } from "../../../services/mixins/cipher/helpers"

export interface CipherActionProps {
  children?: React.ReactNode,
  isOpen?: boolean,
  onClose?: () => void,
  navigation: any,
  onLoadingChange?: Function
}

/**
 * Describe your component here
 */
export const CipherAction = observer(function CipherAction(props: CipherActionProps) {
  const { navigation, isOpen, onClose, children } = props

  const [showConfirmTrashModal, setShowConfirmTrashModal] = useState(false)
  const [showConfirmLeaveModal, setShowConfirmLeaveModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showChangeTeamFolderModal, setShowChangeTeamFolderModal] = useState(false)
  const [nextModal, setNextModal] = useState<'changeTeamFolder' | 'share' | 'trashConfirm' | 'leaveConfirm' | null>(null)

  const { getRouteName, translate, getTeam, getWebsiteLogo, color } = useMixins()
  const { toTrashCiphers } = useCipherDataMixins()
  const { getCipherDescription } = useCipherHelpersMixins()
  const { cipherStore, user, uiStore } = useStores()
  const selectedCipher: CipherView = cipherStore.cipherView

  // Computed

  const organizations = cipherStore.organizations
  const teamRole = getTeam(user.teams, selectedCipher.organizationId).role 
  const shareRole = getTeam(organizations, selectedCipher.organizationId).type
  const isShared = shareRole === AccountRole.MEMBER || shareRole === AccountRole.ADMIN
  // const isOwner = shareRole === AccountRole.ADMIN
  const editable = !selectedCipher.organizationId 
    || (teamRole && teamRole !== AccountRoleText.MEMBER )
    || (shareRole === AccountRole.ADMIN || shareRole === AccountRole.OWNER)

  const cipherMapper = (() => {
    switch (selectedCipher.type) {
      case CipherType.Login:
        return {
          img: selectedCipher.login.uri ? getWebsiteLogo(selectedCipher.login.uri) : BROWSE_ITEMS.password.icon,
          backup: BROWSE_ITEMS.password.icon,
          path: 'passwords'
        }
      case CipherType.Card:
        return {
          img: BROWSE_ITEMS.card.icon,
          backup: BROWSE_ITEMS.card.icon,
          path: 'cards'
        }
      case CipherType.Identity:
        return {
          img: BROWSE_ITEMS.identity.icon,
          backup: BROWSE_ITEMS.identity.icon,
          path: 'identities',
          svg: BROWSE_ITEMS.identity.svgIcon
        }
      case CipherType.SecureNote:
        return {
          img: BROWSE_ITEMS.note.icon,
          backup: BROWSE_ITEMS.note.icon,
          path: 'notes',
          svg: BROWSE_ITEMS.note.svgIcon
        }
      case CipherType.CryptoAccount:
        return {
          img: BROWSE_ITEMS.cryptoAccount.icon,
          backup: BROWSE_ITEMS.cryptoAccount.icon,
          path: 'cryptoAccounts',
          svg: BROWSE_ITEMS.cryptoAccount.svgIcon
        }
      case CipherType.CryptoWallet:
        return {
          img: BROWSE_ITEMS.cryptoWallet.icon,
          backup: BROWSE_ITEMS.cryptoWallet.icon,
          path: 'cryptoWallets',
          svg: BROWSE_ITEMS.cryptoWallet.svgIcon
        }
      default:
        return {
          img: BROWSE_ITEMS.password.icon,
          backup: BROWSE_ITEMS.password.icon,
          path: 'passwords'
        }
    }
  })()

  // Methods

  const handleDelete = async () => {
    const res = await toTrashCiphers([selectedCipher.id])
    if (res.kind === 'ok') {
      const routeName = await getRouteName()
      if (routeName.endsWith('__info')) {
        navigation.goBack()
      }
    }
  }

  const handleActionSheetClose = () => {
    onClose()
    switch (nextModal) {
      case 'changeTeamFolder':
        setShowChangeTeamFolderModal(true)
        break
      case 'share':
        setShowShareModal(true)
        break
      case 'trashConfirm':
        setShowConfirmTrashModal(true)
        break
      case 'leaveConfirm':
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
        title={translate('trash.to_trash')}
        desc={translate('trash.to_trash_desc')}
        btnText="OK"
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      <ChangeTeamFolderModal
        isOpen={showChangeTeamFolderModal}
        onClose={() => setShowChangeTeamFolderModal(false)}
      />

      {
        isShared && (
          <LeaveShareModal
            isOpen={showConfirmLeaveModal}
            onClose={() => setShowConfirmLeaveModal(false)}
            cipherId={selectedCipher.id}
            organizationId={selectedCipher.organizationId}
          />
        )
      }

      {/* Modals end */}

      {/* Actionsheet */}
      <ActionSheet
        isOpen={isOpen}
        onClose={handleActionSheetClose}
      >
        <View style={{ width: '100%', paddingHorizontal: 20 }}>
          <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
            {
              cipherMapper.svg ? (
                <cipherMapper.svg height={40} width={40} />
              ) : (
                <Image
                  source={cipherMapper.img}
                  backupSource={cipherMapper.backup}
                  style={{ height: 40, width: 40, borderRadius: 8 }}
                />
              )
            }
            <View style={{ marginLeft: 10 }}>
              <Text
                preset="semibold"
                text={selectedCipher.name}
              />
              {
                !!getCipherDescription(selectedCipher) && (
                  <Text
                    text={getCipherDescription(selectedCipher)}
                    style={{ fontSize: fontSize.small }}
                  />
                )
              }
            </View>
          </View>
        </View>

        <Divider style={{ marginTop: 10 }} />

        <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
          { children }
          {
            !!children && editable && (
              <Divider style={{ marginVertical: 5 }} />
            )
          }

          {
            editable && (
              <View>
                <ActionItem
                  name={translate('common.clone')}
                  icon="clone"
                  action={() => {
                    onClose()
                    navigation.navigate(`${cipherMapper.path}__edit`, { mode: 'clone' })
                  }}
                />

                <ActionItem
                  disabled={uiStore.isOffline && !!selectedCipher.organizationId}
                  name={translate('folder.move_to_folder')}
                  icon="folder-o"
                  action={() => {
                    onClose()
                    navigation.navigate('folders__select', {
                      mode: 'move',
                      initialId: selectedCipher.folderId,
                      cipherIds: [selectedCipher.id]
                    })
                  }}
                />

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

                <ActionItem
                  disabled={uiStore.isOffline && !!selectedCipher.organizationId}
                  name={translate('common.edit')}
                  icon="edit"
                  action={() => {
                    onClose()
                    navigation.navigate(`${cipherMapper.path}__edit`, { mode: 'edit' })
                  }}
                />

                {
                  !isShared && (
                    <ActionItem
                      isPremium
                      disabled={uiStore.isOffline}
                      name={translate('common.share')}
                      icon="share-square-o"
                      action={() => {
                        setNextModal('share')
                        onClose()
                      }}
                    />
                  )
                }

                <ActionItem
                  disabled={uiStore.isOffline && !!selectedCipher.organizationId}
                  name={translate('trash.to_trash')}
                  icon="trash"
                  textColor={color.error}
                  action={() => {
                    setNextModal('trashConfirm')
                    onClose()
                  }}
                />
              </View>
            )
          }

          {
            isShared && (
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
            )
          }
        </ActionSheetContent>
      </ActionSheet>
      {/* Actionsheet end */}
    </View>
  )
})
