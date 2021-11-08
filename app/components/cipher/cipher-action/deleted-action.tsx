import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { color, commonStyles, fontSize } from "../../../theme"
import { Text } from "../../text/text"
import { AutoImage as Image } from "../../auto-image/auto-image"
import { useStores } from "../../../models"
import { BROWSE_ITEMS } from "../../../common/mappings"
import { ActionItem } from "./action-item"
import { CipherType } from "../../../../core/enums"
import { useMixins } from "../../../services/mixins"
import { DeleteConfirmModal } from "../../../screens/auth/browse/trash/delete-confirm-modal"
import { ActionSheet, ActionSheetContent } from "../../action-sheet"
import { Divider } from "../../divider/divider"

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
export const DeletedAction = observer(function DeletedAction(props: DeletedActionProps) {
  const { navigation, isOpen, onClose, children, onLoadingChange } = props

  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const { deleteCiphers, getRouteName, restoreCiphers, translate } = useMixins()
  const { cipherStore, uiStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  // Computed

  const cipherMapper = (() => {
    switch (selectedCipher.type) {
      case CipherType.Login:
        return {
          // img: { uri: selectedCipher.login.uri },
          img: BROWSE_ITEMS.password.icon,
          backup: BROWSE_ITEMS.password.icon,
          path: 'passwords'
        }
      case CipherType.Card:
        return {
          img: BROWSE_ITEMS.card.icon,
          backup: BROWSE_ITEMS.card.icon,
          path: 'cards'
        }
      case CipherType.Identity:
        return {
          img: BROWSE_ITEMS.identity.icon,
          backup: BROWSE_ITEMS.identity.icon,
          path: 'identities',
          svg: BROWSE_ITEMS.identity.svgIcon
        }
      case CipherType.SecureNote:
        return {
          img: BROWSE_ITEMS.note.icon,
          backup: BROWSE_ITEMS.note.icon,
          path: 'notes',
          svg: BROWSE_ITEMS.note.svgIcon
        }
      default:
        return {
          img: BROWSE_ITEMS.password.icon,
          backup: BROWSE_ITEMS.password.icon,
          path: 'passwords'
        }
    }
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
        onClose={onClose}
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
                  style={{ height: 40, width: 40 }}
                />
              )
            }
            <View style={{ marginLeft: 10 }}>
              <Text
                preset="semibold"
                text={selectedCipher.name}
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
              onLoadingChange && onLoadingChange(true)
              onClose()
              setTimeout(() => {
                setShowConfirmModal(true)
                onLoadingChange && onLoadingChange(false)
              }, 1500)
            }}
          />
        </ActionSheetContent>
      </ActionSheet>
      {/* Actionsheet end */}
    </View>
  )
})
