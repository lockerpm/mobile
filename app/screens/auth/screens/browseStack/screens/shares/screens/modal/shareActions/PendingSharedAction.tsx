import { useStores } from "app/models"
import { useCipherData, useCipherHelper } from "app/services/hook"
import { CipherView } from "core/models/view"
import React from "react"
import { View } from "react-native"
import { Text } from "app/components/cores"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"
import { IS_IOS } from "app/config/constants"
import { useAppLocale } from "app/services/context"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils"
import { CipherIconImage } from "app/components/newCiphers"
import { CipherType } from "core/enums"

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
  const { translate } = useAppLocale()

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
      <NewActionSheet
        isOpen={isOpen}
        onClose={handleActionSheetClose}
        header={
          <View style={{ width: "100%", paddingHorizontal: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <CipherIconImage
                cipherType={CipherType.Login}
                source={cipherMapper.img}
                style={{ height: 40, width: 40, borderRadius: 8 }}
              />

              <View style={{ marginLeft: 10 }}>
                <Text preset="bold" text={selectedCipher.name} />
              </View>
            </View>
          </View>
        }
      >
        <NewActionSheetItem tx="common.accept" onPress={handleAccept} />

        <NewActionSheetItem tx="common.reject" onPress={handleReject} />
      </NewActionSheet>
      {/* Actionsheet end */}
    </View>
  )
}
