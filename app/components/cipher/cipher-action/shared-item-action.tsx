import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { CipherView } from "../../../../core/models/view"
import { useStores } from "../../../models"
import { useMixins } from "../../../services/mixins"
import { CipherType } from "../../../../core/enums"
import { BROWSE_ITEMS } from "../../../common/mappings"
import { ActionItem, ActionSheet, ActionSheetContent, AutoImage as Image, Divider, Text } from "../.."
import { commonStyles, fontSize } from "../../../theme"
import { AccountRole } from "../../../config/types"
import { LeaveShareModal } from "./leave-share-modal"

interface SharedItemActionProps {
  children?: React.ReactNode,
  isOpen?: boolean,
  onClose?: () => void,
  navigation: any,
  onLoadingChange?: Function
}

/**
 * Describe your component here
 */
export const SharedItemAction = observer((props: SharedItemActionProps) => {
  const { navigation, isOpen, onClose, children } = props
  const { translate, getWebsiteLogo, color } = useMixins()
  const { cipherStore, uiStore } = useStores()

  // Params

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [nextModal, setNextModal] = useState<'leave' | null>(null)

  // Computed
  const selectedCipher: CipherView = cipherStore.cipherView
  const org = cipherStore.organizations.find(o => o.id === selectedCipher.organizationId)

  const editable = org?.type === AccountRole.ADMIN

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

  const handleActionSheetClose = () => {
    onClose()
    switch (nextModal) {
      case 'leave':
        setShowConfirmModal(true)
        break
    }
    setNextModal(null)
  }

  // Render

  return (
    <View>
      {/* Modals */}

      <LeaveShareModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        cipherId={selectedCipher.id}
        organizationId={selectedCipher.organizationId}
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

          <Divider style={{ marginVertical: 5 }} />

          <ActionItem
            name={translate('common.clone')}
            icon="clone"
            action={() => {
              onClose()
              navigation.navigate(`${cipherMapper.path}__edit`, { mode: 'clone' })
            }}
          />

          <ActionItem
            disabled={uiStore.isOffline}
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

          <Divider style={{ marginVertical: 5 }} />

          <ActionItem
            disabled={uiStore.isOffline || !editable}
            name={translate('common.edit')}
            icon="edit"
            action={() => {
              onClose()
              navigation.navigate(`${cipherMapper.path}__edit`, { mode: 'edit' })
            }}
          />

          <ActionItem
            disabled={uiStore.isOffline}
            name={translate('shares.leave')}
            icon="sign-out"
            textColor={color.error}
            action={() => {
              setNextModal('leave')
              onClose()
            }}
          />
        </ActionSheetContent>
      </ActionSheet>
      {/* Actionsheet end */}
    </View>
  )
})
