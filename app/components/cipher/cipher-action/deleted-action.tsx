import React, { useState } from "react"
import { ScrollView, View } from "react-native"
import { observer } from "mobx-react-lite"
import { color, commonStyles, fontSize } from "../../../theme"
import { Text } from "../../text/text"
import { AutoImage as Image } from "../../auto-image/auto-image"
import { useStores } from "../../../models"
import { Actionsheet, Divider } from "native-base"
import { BROWSE_ITEMS } from "../../../common/mappings"
import { ActionItem } from "./action-item"
import { CipherType } from "../../../../core/enums"
import { useMixins } from "../../../services/mixins"
import { DeleteConfirmModal } from "../../../screens/auth/browse/trash/delete-confirm-modal"
import { translate } from "../../../i18n"

export interface DeletedActionProps {
  children?: React.ReactNode,
  isOpen?: boolean,
  onClose?: Function,
  navigation: any
}

/**
 * Describe your component here
 */
export const DeletedAction = observer(function DeletedAction(props: DeletedActionProps) {
  const { navigation, isOpen, onClose, children } = props

  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const { deleteCiphers, getRouteName, restoreCiphers } = useMixins()
  const { cipherStore } = useStores()
  const selectedCipher = cipherStore.cipherView

  // Computed

  const cipherMapper = (() => {
    switch (selectedCipher.type) {
      case CipherType.Login:
        return {
          img: { uri: selectedCipher.login.uri },
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
          path: 'identities'
        }
      case CipherType.SecureNote:
        return {
          img: BROWSE_ITEMS.note.icon,
          backup: BROWSE_ITEMS.note.icon,
          path: 'notes'
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
    await restoreCiphers([selectedCipher.id])
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
      <Actionsheet
        isOpen={isOpen}
        onClose={onClose}
      >
        <Actionsheet.Content>
          <View style={{ width: '100%', paddingHorizontal: 20 }}>
            <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
              <Image
                source={cipherMapper.img}
                backupSource={cipherMapper.backup}
                style={{ height: 40, width: 40, marginRight: 10 }}
              />
              <View>
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

          <Divider borderColor={color.line} marginBottom={1} marginTop={5} />

          <ScrollView style={{ width: '100%' }}>
            { children }
            {
              !!children && (
                <Divider borderColor={color.line} marginY={1} />
              )
            }

            <ActionItem
              name={translate('common.edit')}
              icon="edit"
              action={() => {
                onClose()
                navigation.navigate(`${cipherMapper.path}__edit`, { mode: 'edit' })
              }}
            />

            <ActionItem
              name={translate('common.restore')}
              icon="repeat"
              action={() => {
                onClose()
                handleRestore()
              }}
            />

            <ActionItem
              name={translate('trash.perma_delete')}
              icon="trash"
              textColor={color.error}
              action={() => {
                onClose()
                setTimeout(() => setShowConfirmModal(true), 100)
              }}
            />
          </ScrollView>
        </Actionsheet.Content>
      </Actionsheet>
      {/* Actionsheet end */}
    </View>
  )
})
