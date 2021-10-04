import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { color, commonStyles, fontSize } from "../../../theme"
import { useStores } from "../../../models"
import { OwnershipAction } from "./ownership-action"
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

export interface CipherActionProps {
  children?: React.ReactNode,
  isOpen?: boolean,
  onClose?: () => void,
  navigation: any
}

/**
 * Describe your component here
 */
export const CipherAction = observer(function CipherAction(props: CipherActionProps) {
  const { navigation, isOpen, onClose, children } = props

  const [showOwnershipAction, setShowOwnershipAction] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const { toTrashCiphers, getRouteName, translate } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  // Computed

  const cipherMapper = (() => {
    switch (selectedCipher.type) {
      case CipherType.Login:
        return {
          img: { uri: selectedCipher.login.uri },
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
          path: 'identities'
        }
      case CipherType.SecureNote:
        return {
          img: BROWSE_ITEMS.note.icon,
          backup: BROWSE_ITEMS.note.icon,
          path: 'notes'
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

  const handelDelete = async () => {
    const res = await toTrashCiphers([selectedCipher.id])
    if (res.kind === 'ok') {
      const routeName = await getRouteName()
      if (routeName.endsWith('__info')) {
        navigation.goBack()
      }
    }
  }

  // Render

  return (
    <View>
      {/* Modals */}

      <OwnershipAction
        isOpen={showOwnershipAction}
        onClose={() => setShowOwnershipAction(false)}
      />

      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handelDelete}
        title={translate('trash.to_trash')}
        desc={translate('trash.to_trash_desc')}
        btnText="OK"
      />

      {/* Modals end */}

      {/* Actionsheet */}
      <ActionSheet
        isOpen={isOpen}
        onClose={onClose}
      >
        <View style={{ width: '100%', paddingHorizontal: 20 }}>
          <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
            <Image
              source={cipherMapper.img}
              backupSource={cipherMapper.backup}
              style={{ height: 40, width: 40, marginRight: 10 }}
            />
            <View>
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
            !!children && (
              <Divider style={{ marginVertical: 5 }} />
            )
          }

          <ActionItem
            name={translate('common.clone')}
            icon="clone"
            action={() => {
              onClose()
              navigation.navigate(`${cipherMapper.path}__edit`, { mode: 'clone' })
            }}
          />

          <ActionItem
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

          <ActionItem
            disabled={true}
            name={translate('common.change_ownership')}
            icon="user-o"
            action={() => {
              onClose()
              setTimeout(() => setShowOwnershipAction(true), 1000)
            }}
          />

          <Divider style={{ marginVertical: 5 }} />

          <ActionItem
            name={translate('common.edit')}
            icon="edit"
            action={() => {
              onClose()
              navigation.navigate(`${cipherMapper.path}__edit`, { mode: 'edit' })
            }}
          />

          <ActionItem
            disabled={true}
            name={translate('common.share')}
            icon="share-square-o"
          />

          <ActionItem
            name={translate('trash.to_trash')}
            icon="trash"
            textColor={color.error}
            action={() => {
              onClose()
              setTimeout(() => {
                setShowConfirmModal(true)
              }, 1000)
            }}
          />
        </ActionSheetContent>
      </ActionSheet>
      {/* Actionsheet end */}
    </View>
  )
})
