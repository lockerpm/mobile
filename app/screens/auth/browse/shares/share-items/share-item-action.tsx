import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { CipherView } from "../../../../../../core/models/view"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { CipherType } from "../../../../../../core/enums"
import { ActionItem, ActionSheet, ActionSheetContent, AutoImage as Image, Divider, Text } from "../../../../../components"
import { commonStyles } from "../../../../../theme"
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data"
import { SharedMemberType } from "../../../../../services/api/api.types"
import { EditShareModal } from "./edit-share-modal"
import { SharingStatus } from "../../../../../config/types"
import { ConfirmShareModal } from "./confirm-share-modal"

type Props = {
  isOpen: boolean
  onClose: () => void
  onLoadingChange: Function
  member: SharedMemberType
  goToDetail: Function
}

/**
 * Describe your component here
 */
export const ShareItemAction = observer((props: Props) => {
  const { isOpen, onClose, onLoadingChange, member, goToDetail } = props
  const { translate, getWebsiteLogo } = useMixins()
  const { stopShareCipher } = useCipherDataMixins()
  const { cipherStore, uiStore } = useStores()

  // Params

  const [nextModal, setNextModal] = useState<'edit' | 'confirm' | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Computed

  const selectedCipher: CipherView = cipherStore.cipherView

  const cipherMapper = (() => {
    switch (selectedCipher.type) {
      case CipherType.Login:
        return {
          img: selectedCipher.login.uri ? getWebsiteLogo(selectedCipher.login.uri) : BROWSE_ITEMS.password.icon,
          backup: BROWSE_ITEMS.password.icon
        }
      case CipherType.Card:
        return {
          img: BROWSE_ITEMS.card.icon,
          backup: BROWSE_ITEMS.card.icon
        }
      case CipherType.Identity:
        return {
          img: BROWSE_ITEMS.identity.icon,
          backup: BROWSE_ITEMS.identity.icon,
          svg: BROWSE_ITEMS.identity.svgIcon
        }
      case CipherType.SecureNote:
        return {
          img: BROWSE_ITEMS.note.icon,
          backup: BROWSE_ITEMS.note.icon,
          svg: BROWSE_ITEMS.note.svgIcon
        }
      default:
        return {
          img: BROWSE_ITEMS.password.icon,
          backup: BROWSE_ITEMS.password.icon
        }
    }
  })()

  // Methods

  const handleStopShare = async () => {
    onClose()
    onLoadingChange(true)
    await stopShareCipher(selectedCipher, member.id)
    onLoadingChange(false)
  }

  const handleActionSheetClose = () => {
    onClose()
    switch (nextModal) {
      case 'confirm':
        setShowConfirmModal(true)
        break
      case 'edit':
        setShowEditModal(true)
        break
    }
    setNextModal(null)
  }

  // Render

  return (
    <View>
      {/* Modals */}

      <EditShareModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        member={member}
      />

      <ConfirmShareModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        member={member}
        organizationId={selectedCipher.organizationId}
      />

      {/* Modals end */}

      {/* Actionsheet */}
      <ActionSheet
        isOpen={isOpen}
        onClose={handleActionSheetClose}
      >
        {/* Cipher info */}
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
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text
                preset="semibold"
                text={selectedCipher.name}
                numberOfLines={2}
              />
            </View>
          </View>
        </View>
        {/* Cipher info end */}

        <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
          <Divider style={{ marginVertical: 5 }} />

          <ActionItem
            name={translate('common.details')}
            action={() => {
              goToDetail(selectedCipher)
              onClose()
            }}
          />

          {
            member?.status === SharingStatus.ACCEPTED && (
              <ActionItem
                disabled={uiStore.isOffline}
                name={translate('common.confirm')}
                action={() => {
                  setNextModal('confirm')
                  onClose()
                }}
              />
            )
          }

          <ActionItem
            disabled={uiStore.isOffline}
            name={translate('common.edit')}
            action={() => {
              setNextModal('edit')
              onClose()
            }}
          />

          <ActionItem
            disabled={uiStore.isOffline}
            name={translate('shares.stop_sharing')}
            action={handleStopShare}
          />
        </ActionSheetContent>
      </ActionSheet>
      {/* Actionsheet end */}
    </View>
  )
})
