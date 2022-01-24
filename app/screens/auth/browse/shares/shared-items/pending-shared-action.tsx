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

type Props = {
  isOpen: boolean
  onClose: () => void
  onLoadingChange: Function
}

/**
 * Describe your component here
 */
export const PendingSharedAction = observer((props: Props) => {
  const { isOpen, onClose, onLoadingChange } = props
  const { translate } = useMixins()
  const { acceptShareInvitation, rejectShareInvitation } = useCipherDataMixins()
  const { cipherStore, uiStore } = useStores()

  // Params

  const [nextModal, setNextModal] = useState<null>(null)

  // Computed

  const selectedCipher: CipherView = cipherStore.cipherView

  const cipherMapper = (() => {
    switch (selectedCipher.type) {
      case CipherType.Login:
        return {
          img: BROWSE_ITEMS.password.icon,
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

  const handleActionSheetClose = () => {
    onClose()
    switch (nextModal) {
     
    }
    setNextModal(null)
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
      {/* Modals */}

      

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
            </View>
          </View>
        </View>

        <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
          <Divider style={{ marginVertical: 5 }} />

          <ActionItem
            disabled={uiStore.isOffline}
            name={translate('common.accept')}
            icon="angle-right"
            action={handleAccept}
          />

          <ActionItem
            disabled={uiStore.isOffline}
            name={translate('common.reject')}
            icon="angle-right"
            action={handleReject}
          />
        </ActionSheetContent>
      </ActionSheet>
      {/* Actionsheet end */}
    </View>
  )
})
