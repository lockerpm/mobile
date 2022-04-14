import React, { useState } from "react"
import { Text, ActionItem, ActionSheet, Divider, ActionSheetContent } from "../../../../components"
import { color, commonStyles } from "../../../../theme"
import { View } from "react-native"
import { TOOLS_ITEMS } from "../../../../common/mappings"
import { useMixins } from "../../../../services/mixins"
import { DeleteConfirmModal } from "../../browse/trash/delete-confirm-modal"
import { CipherView } from "../../../../../core/models/view"
import { parseOTPUri, getTOTP } from "../../../../utils/totp"
import { useStores } from "../../../../models"
import { useCipherDataMixins } from "../../../../services/mixins/cipher/data"
import { observer } from "mobx-react-lite"


type Props = {
  navigation: any
  isOpen?: boolean
  onClose?: () => void
  onLoadingChange?: Function
  cipher: CipherView
}


export const AuthenticatorAction = observer((props: Props) => {
  const { navigation, isOpen, onClose, onLoadingChange, cipher } = props
  const { translate, copyToClipboard } = useMixins()
  const { deleteCiphers } = useCipherDataMixins()
  const { cipherStore } = useStores()

  // ---------------- PARAMS -----------------

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [nextModal, setNextModal] = useState<'deleteConfirm' | null>(null)

  // ---------------- COMPUTED -----------------

  const otp = parseOTPUri(cipher.notes)

  // ---------------- METHODS -----------------

  const handleDelete = async () => {
    onLoadingChange && onLoadingChange(true)
    const res = await deleteCiphers([cipher.id])
    if (res.kind === 'unauthorized') {
      onClose && onClose()
    }
    onLoadingChange && onLoadingChange(false)
  }

  const handleActionSheetClose = () => {
    onClose()
    switch (nextModal) {
      case 'deleteConfirm':
        setShowConfirmModal(true)
        break
    }
    setNextModal(null)
  }
  
  // ---------------- RENDER -----------------

  return (
    <View>
      {/* Modals / Actions */}

      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title={translate('trash.delete_item')}
        desc={translate('trash.delete_desc')}
        btnText={translate('common.delete')}
      />

      {/* Modals / Actions end */}

      <ActionSheet
        isOpen={isOpen}
        onClose={handleActionSheetClose}
      >
        {/* Info */}
        <View style={{ width: '100%', paddingHorizontal: 20 }}>
          <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
            <TOOLS_ITEMS.authenticator.svgIcon height={40} />
            <View style={{ marginLeft: 10, flex: 1  }}>
              <Text
                preset="semibold"
                text={cipher.name}
                numberOfLines={2}
              />
            </View>
          </View>
        </View>
        {/* Info end */}

        <Divider style={{ marginTop: 10 }} />

        <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
          <ActionItem
            name={translate('authenticator.copy_code')}
            icon="copy"
            action={() => {
              copyToClipboard(getTOTP(otp))
            }}
          />

          {
            __DEV__ && (
              <ActionItem
                name={'(DEBUG) Log note'}
                icon="copy"
                action={() => {
                  console.log(otp)
                  console.log(cipher.notes)
                }}
              />
            )
          }

          <Divider style={{ marginVertical: 5 }} />

          <ActionItem
            name={translate('common.edit')}
            icon="edit"
            action={() => {
              cipherStore.setSelectedCipher(cipher)
              onClose()
              navigation.navigate('authenticator__edit', { mode: 'edit' })
            }}
          />

          <ActionItem
            name={translate('common.delete')}
            icon="trash"
            textColor={color.error}
            action={() => {
              setNextModal('deleteConfirm')
              onClose()
            }}
          />
        </ActionSheetContent>
      </ActionSheet>
    </View>
  )
})
