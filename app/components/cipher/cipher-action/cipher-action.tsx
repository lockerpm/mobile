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

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showChangeTeamFolderModal, setShowChangeTeamFolderModal] = useState(false)
  const [nextModal, setNextModal] = useState<'changeTeamFolder' | 'share' | 'trashConfirm' | null>(null)

  const { toTrashCiphers, getRouteName, translate, getTeam, getWebsiteLogo, color } = useMixins()
  const { cipherStore, user, uiStore } = useStores()
  const selectedCipher: CipherView = cipherStore.cipherView

  // Computed

  const teamUser = getTeam(user.teams, selectedCipher.organizationId)
  const editable = !selectedCipher.organizationId || teamUser.role !== 'member'

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
        setShowConfirmModal(true)
        break
    }
    setNextModal(null)
  }

  // Render

  return (
    <View>
      {/* Modals */}

      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
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
                (selectedCipher.type === CipherType.Login && !!selectedCipher.login.username) && (
                  <Text
                    text={selectedCipher.login.username}
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

                {
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
                }

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
                  !selectedCipher.organizationId && (
                    <ActionItem
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
        </ActionSheetContent>
      </ActionSheet>
      {/* Actionsheet end */}
    </View>
  )
})
