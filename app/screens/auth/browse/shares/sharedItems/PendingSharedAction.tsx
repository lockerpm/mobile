import { ActionItem, ActionSheet } from 'app/components/ciphers'
import { useStores } from 'app/models'
import { useCipherData, useCipherHelper } from 'app/services/hook'
import { CipherView } from 'core/models/view'
import React from 'react'
import { View, Image } from 'react-native'
import { Text } from 'app/components/cores'
import { translate } from 'app/i18n'

type Props = {
  isOpen: boolean
  onClose: () => void
  onLoadingChange: (val: boolean) => void
}

/**
 * Describe your component here
 */
export const PendingSharedAction = (props: Props) => {
  const { isOpen, onClose, onLoadingChange } = props
  const { acceptShareInvitation, rejectShareInvitation } = useCipherData()
  const { getCipherInfo } = useCipherHelper()
  const { cipherStore, uiStore } = useStores()

  // Params

  const selectedCipher: CipherView = cipherStore.cipherView

  const cipherMapper = (() => {
    const cipherInfo = getCipherInfo(selectedCipher)
    return cipherInfo
  })()

  // Methods

  const handleActionSheetClose = () => {
    onClose()
  }

  const handleAccept = async () => {
    onClose()
    onLoadingChange(true)
    await acceptShareInvitation(selectedCipher.id)
    onLoadingChange(false)
  }

  const handleReject = async () => {
    onClose()
    onLoadingChange(true)
    await rejectShareInvitation(selectedCipher.id)
    onLoadingChange(false)
  }

  // Render

  return (
    <View>
      {/* Actionsheet */}
      <ActionSheet
        isOpen={isOpen}
        onClose={handleActionSheetClose}
        header={
          <View style={{ width: '100%', paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={cipherMapper.img} style={{ height: 40, width: 40, borderRadius: 8 }} />

              <View style={{ marginLeft: 10 }}>
                <Text preset="bold" text={selectedCipher.name} />
              </View>
            </View>
          </View>
        }
      >
        <ActionItem
          disabled={uiStore.isOffline}
          name={translate('common.accept')}
          action={handleAccept}
        />

        <ActionItem
          disabled={uiStore.isOffline}
          name={translate('common.reject')}
          action={handleReject}
        />
      </ActionSheet>
      {/* Actionsheet end */}
    </View>
  )
}
