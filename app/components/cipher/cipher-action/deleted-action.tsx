import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { color, commonStyles, fontSize } from "../../../theme"
import { Text } from "../../text/text"
import { AutoImage as Image } from "../../auto-image/auto-image"
import { useStores } from "../../../models"
import { ActionItem } from "./action-item"
import { CipherType } from "../../../../core/enums"
import { useMixins } from "../../../services/mixins"
import { DeleteConfirmModal } from "../../../screens/auth/browse/trash/delete-confirm-modal"
import { ActionSheet, ActionSheetContent } from "../../action-sheet"
import { Divider } from "../../divider/divider"
import { useCipherDataMixins } from "../../../services/mixins/cipher/data"
import { useCipherHelpersMixins } from "../../../services/mixins/cipher/helpers"

export interface DeletedActionProps {
  children?: React.ReactNode,
  isOpen?: boolean,
  onClose?: () => void,
  navigation: any,
  onLoadingChange?: Function,
}

/**
 * Describe your component here
 */
export const DeletedAction = observer((props: DeletedActionProps) => {
  const { navigation, isOpen, onClose, children } = props

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [nextModal, setNextModal] = useState<'deleteConfirm' | null>(null)

  const { getRouteName, translate } = useMixins()
  const { deleteCiphers, restoreCiphers } = useCipherDataMixins()
  const { getCipherInfo } = useCipherHelpersMixins()
  const { cipherStore, uiStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  // Computed

  const cipherMapper = (() => {
    const cipherInfo = getCipherInfo(selectedCipher)
    return cipherInfo
  })()

  // Methods

  const handleRestore = async () => {
    const res = await restoreCiphers([selectedCipher.id])
    if (res.kind === 'ok') {
      let routeName = await getRouteName()
      if (routeName.endsWith('__info')) {
        navigation.goBack()
      }
    }
  }

  const handleDelete = async () => {
    const res = await deleteCiphers([selectedCipher.id])
    if (res.kind === 'ok') {
      let routeName = await getRouteName()
      if (routeName.endsWith('__info')) {
        navigation.goBack()
      }
    }
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

  // Render

  return (
    <View>
      {/* Modals */}

      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title={translate('trash.perma_delete')}
        desc={translate('trash.perma_delete_desc')}
        btnText="OK"
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
              {
                (selectedCipher.type === CipherType.Login && !!selectedCipher.login.username) && (
                  <Text
                    text={selectedCipher.login.username}
                    style={{ fontSize: fontSize.small }}
                  />
                )
              }
            </View>
          </View>
        </View>
        {/* Cipher info end */}

        <Divider style={{ marginTop: 10 }} />

        <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
          { children }
          {
            !!children && (
              <Divider style={{ marginVertical: 5 }} />
            )
          }

          <ActionItem
            disabled={uiStore.isOffline && !!selectedCipher.organizationId}
            name={translate('common.edit')}
            icon="edit"
            action={() => {
              onClose()
              navigation.navigate(`${cipherMapper.path}__edit`, { mode: 'edit' })
            }}
          />

          <ActionItem
            disabled={uiStore.isOffline && !!selectedCipher.organizationId}
            name={translate('common.restore')}
            icon="repeat"
            action={() => {
              onClose()
              handleRestore()
            }}
          />

          <ActionItem
            disabled={uiStore.isOffline && !!selectedCipher.organizationId}
            name={translate('trash.perma_delete')}
            icon="trash"
            textColor={color.error}
            action={() => {
              setNextModal('deleteConfirm')
              onClose()
            }}
          />
        </ActionSheetContent>
      </ActionSheet>
      {/* Actionsheet end */}
    </View>
  )
})
