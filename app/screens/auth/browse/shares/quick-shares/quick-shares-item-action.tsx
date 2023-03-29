import React from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { useMixins } from "../../../../../services/mixins"
import {
  ActionItem,
  ActionSheet,
  ActionSheetContent,
  AutoImage as Image,
  Divider,
  Text,
} from "../../../../../components"
import { commonStyles } from "../../../../../theme"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"
import { SendView } from "../../../../../../core/models/view/sendView"
import { useStores } from "../../../../../models"

type Props = {
  isOpen: boolean
  onClose: () => void
  onLoadingChange: Function
  navigation: any
  selectedCipher: SendView
}

/**
 * Describe your component here
 */
export const QuickSharesItemAction = observer((props: Props) => {
  const { isOpen, onClose, selectedCipher, navigation } = props
  const { color, notifyApiError, copyToClipboard } = useMixins()
  const { getCipherInfo } = useCipherHelpersMixins()
  const { cipherStore } = useStores()

  if (selectedCipher === null) return null

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
    const url = cipherStore.getPublicShareUrl(selectedCipher.accessId, selectedCipher.key)
    copyToClipboard(url)
    onClose()
  }

  return (
    <ActionSheet isOpen={isOpen} onClose={onClose}>
      {/* Cipher info */}
      <View style={{ width: "100%", paddingHorizontal: 20 }}>
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          {cipherMapper.svg ? (
            <cipherMapper.svg height={40} width={40} />
          ) : (
            <Image
              source={cipherMapper.img}
              backupSource={cipherMapper.backup}
              style={{ height: 40, width: 40, borderRadius: 8 }}
            />
          )}
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text preset="semibold" text={selectedCipher.cipher.name} numberOfLines={2} />
          </View>
        </View>
      </View>
      {/* Cipher info end */}

      <Divider style={{ marginTop: 10 }} />

      <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
        <ActionItem
          name={"Quick share detail"}
          icon="list-alt"
          action={() => {
            onClose()
            navigation.navigate("quickShareItemsDetail", { send: selectedCipher })
          }}
        />

        <ActionItem name={"Copy link"} icon="link" action={copyShareLink} />

        <ActionItem
          name={"Stop sharing"}
          icon="trash"
          textColor={color.error}
          action={stopQuickShare}
        />
      </ActionSheetContent>
    </ActionSheet>
  )
})
