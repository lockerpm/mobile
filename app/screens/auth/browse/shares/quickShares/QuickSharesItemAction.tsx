import { ActionItem, ActionSheet } from "app/components/ciphers"
import { useStores } from "app/models"
import { useTheme } from "app/services/context"
import { useCipherHelper, useHelper } from "app/services/hook"
import { SendView } from "core/models/view/sendView"
import React from "react"
import { View } from "react-native"
import { Text } from "app/components/cores"
import { observer } from "mobx-react-lite"
import { Utils } from "app/services/coreService/utils"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"
import { CipherIconImage } from "app/components/ciphers/cipherList/CipherIconImage"
import { IS_IOS } from "app/config/constants"

type Props = {
  isOpen: boolean
  onClose: () => void
  onLoadingChange: (val: boolean) => void
  navigation: any
  selectedCipher: SendView
}

/**
 * Describe your component here
 */
export const QuickSharesItemAction = observer((props: Props) => {
  const { isOpen, onClose, selectedCipher, navigation } = props
  const { colors } = useTheme()
  const { notifyApiError, copyToClipboard, translate } = useHelper()
  const { getCipherInfo } = useCipherHelper()
  const { cipherStore } = useStores()

  if (selectedCipher === null) return null

  selectedCipher.revisionDate = null

  const isExpired = selectedCipher.expirationDate?.getTime() < Date.now()

  const cipherMapper = (() => {
    const cipherInfo = getCipherInfo(selectedCipher.cipher)
    return cipherInfo
  })()

  const stopQuickShare = async () => {
    const res = await cipherStore.stopQuickSharing(selectedCipher)
    if (res.kind !== "ok") {
      notifyApiError(res)
    }
    onClose()
  }

  const copyShareLink = () => {
    const url = cipherStore.getPublicShareUrl(
      selectedCipher.accessId,
      Utils.bufferToBase64url(selectedCipher.key),
    )
    copyToClipboard(url)
    onClose()
  }

  return (
    <ActionSheet
      isOpen={isOpen}
      onClose={onClose}
      header={
        <View style={{ width: "100%", paddingHorizontal: 20, marginBottom: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <CipherIconImage
              defaultSource={IS_IOS ? BROWSE_ITEMS.password.icon : undefined}
              source={cipherMapper.img}
              style={{ height: 40, width: 40, borderRadius: 8, opacity: isExpired ? 0.3 : 1 }}
            />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text
                preset="bold"
                color={isExpired ? colors.disable : colors.title}
                text={isExpired ? selectedCipher.cipher.name : selectedCipher.cipher.name}
                numberOfLines={2}
              />
            </View>
          </View>
        </View>
      }
    >
      {!isExpired && (
        <ActionItem
          name={translate("quick_shares.action.detail")}
          icon="list-bullets"
          action={() => {
            onClose()
            navigation.navigate("quickShareItemsDetail", { send: selectedCipher })
          }}
        />
      )}

      {!isExpired && (
        <ActionItem
          name={translate("quick_shares.action.copy")}
          icon="link"
          action={copyShareLink}
        />
      )}

      <ActionItem
        name={
          isExpired
            ? translate("quick_shares.delete_expired")
            : translate("quick_shares.action.stop")
        }
        icon="trash"
        color={colors.error}
        action={stopQuickShare}
      />
    </ActionSheet>
  )
})
