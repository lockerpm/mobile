import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { CipherView } from "../../../../../../core/models/view"
import { ActionItem, ActionSheet, ActionSheetContent, AutoImage as Image, Divider, Text } from "../../../../../components"
import { commonStyles } from "../../../../../theme"
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data"
import { SharedMemberType } from "../../../../../services/api/api.types"
import { EditShareModal } from "./edit-share-modal"
import { SharingStatus } from "../../../../../config/types"
import { ConfirmShareModal } from "./confirm-share-modal"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"

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
  const { translate } = useMixins()
  const { stopShareCipher } = useCipherDataMixins()
  const { getCipherInfo } = useCipherHelpersMixins()
  const { cipherStore, uiStore } = useStores()

  // Params

  const [nextModal, setNextModal] = useState<'edit' | 'confirm' | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Computed

  const selectedCipher: CipherView = cipherStore.cipherView

  const cipherMapper = (() => {
    const cipherInfo = getCipherInfo(selectedCipher)
    return cipherInfo
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
            icon="list-alt"
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
            icon="edit"
            action={() => {
              setNextModal('edit')
              onClose()
            }}
          />

          <ActionItem
            disabled={uiStore.isOffline}
            icon="stop-circle"
            name={translate('shares.stop_sharing')}
            action={handleStopShare}
          />
        </ActionSheetContent>
      </ActionSheet>
      {/* Actionsheet end */}
    </View>
  )
})
