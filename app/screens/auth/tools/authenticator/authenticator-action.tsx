import React, { useState } from "react"
import { Text, ActionItem, ActionSheet, Divider, ActionSheetContent } from "../../../../components"
import { color, commonStyles } from "../../../../theme"
import { View } from "react-native"
import { TOOLS_ITEMS } from "../../../../common/mappings"
import { useMixins } from "../../../../services/mixins"
import { DeleteConfirmModal } from "../../browse/trash/delete-confirm-modal"
import { CipherView } from "../../../../../core/models/view"
import { parseOTPUri, getTOTP } from "../../../../utils/totp"


type Props = {
  isOpen?: boolean,
  onClose?: () => void,
  onLoadingChange?: Function,
  cipher: CipherView
}


export const AuthenticatorAction = (props: Props) => {
  const { isOpen, onClose, onLoadingChange, cipher } = props
  const { translate, copyToClipboard, deleteCiphers } = useMixins()

  // ---------------- PARAMS -----------------

  const [showConfirmModal, setShowConfirmModal] = useState(false)

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
        onClose={onClose}
      >
        <View style={{ width: '100%', paddingHorizontal: 20 }}>
          <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
            <TOOLS_ITEMS.authenticator.svgIcon height={40} />
            <View>
              <Text
                preset="semibold"
                text={cipher.name}
                style={{ marginLeft: 10 }}
              />
            </View>
          </View>
        </View>

        <Divider style={{ marginTop: 10 }} />

        <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
          <ActionItem
            name={translate('authenticator.copy_code')}
            icon="copy"
            action={() => {
              copyToClipboard(getTOTP(otp))
            }}
          />

          <ActionItem
            name={translate('common.delete')}
            icon="trash"
            textColor={color.error}
            action={() => {
              onLoadingChange && onLoadingChange(true)
              onClose()
              setTimeout(() => {
                onLoadingChange && onLoadingChange(false)
                setShowConfirmModal(true)
              }, 1500)
            }}
          />
        </ActionSheetContent>
      </ActionSheet>
    </View>
  )
}
