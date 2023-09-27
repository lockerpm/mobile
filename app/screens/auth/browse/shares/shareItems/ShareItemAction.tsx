import React, { useState } from 'react'
import { View, Image } from 'react-native'
import { EditShareModal } from './EditShareModal'
import { SharedMemberType } from 'app/static/types'
import { useCipherData, useCipherHelper } from 'app/services/hook'
import { useStores } from 'app/models'
import { CipherView } from 'core/models/view'
import { ActionItem, ActionSheet } from 'app/components/ciphers'
import { Text } from 'app/components/cores'
import { translate } from 'app/i18n'

type Props = {
  isOpen: boolean
  onClose: () => void
  onLoadingChange: (val: boolean) => void
  member: SharedMemberType
  goToDetail: (val: any) => void
}

/**
 * Describe your component here
 */
export const ShareItemAction = (props: Props) => {
  const { isOpen, onClose, onLoadingChange, member, goToDetail } = props
  const { stopShareCipher } = useCipherData()
  const { getCipherInfo } = useCipherHelper()
  const { cipherStore, uiStore } = useStores()

  // Params

  const [nextModal, setNextModal] = useState<'edit' | 'confirm' | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

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
      <EditShareModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        member={member}
      />

      <ActionSheet
        isOpen={isOpen}
        onClose={handleActionSheetClose}
        header={
          <View style={{ width: '100%', paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={cipherMapper.img} style={{ height: 40, width: 40, borderRadius: 8 }} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text preset="bold" text={selectedCipher.name} numberOfLines={2} />
              </View>
            </View>
          </View>
        }
      >
        <ActionItem
          name={translate('common.details')}
          icon="list-bullets"
          action={() => {
            goToDetail(selectedCipher)
            onClose()
          }}
        />

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
          icon="x-circle"
          name={translate('shares.stop_sharing')}
          action={handleStopShare}
        />
      </ActionSheet>
    </View>
  )
}
