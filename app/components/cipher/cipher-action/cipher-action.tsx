import React, { useState } from "react"
import { ScrollView, View } from "react-native"
import { observer } from "mobx-react-lite"
import { color, commonStyles } from "../../../theme"
import { Text, AutoImage as Image } from "../.."
import { useStores } from "../../../models"
import { OwnershipAction } from "./ownership-action"
import { Actionsheet, Divider } from "native-base"
import { BROWSE_ITEMS } from "../../../common/mappings"
import { ActionItem } from "./action-item"
import { CipherType } from "../../../../core/enums"
import { useMixins } from "../../../services/mixins"
import { DeleteConfirmModal } from "../../../screens/auth/browse/trash/delete-confirm-modal"

export interface CipherActionProps {
  children?: React.ReactNode,
  isOpen?: boolean,
  onClose?: Function,
  navigation: any
}

/**
 * Describe your component here
 */
export const CipherAction = observer(function CipherAction(props: CipherActionProps) {
  const { navigation, isOpen, onClose, children } = props

  const [showOwnershipAction, setShowOwnershipAction] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const { toTrashCiphers, getRouteName } = useMixins()
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
          img: BROWSE_ITEMS.indentity.icon,
          backup: BROWSE_ITEMS.indentity.icon,
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
  
  // Render

  return (
    <View>
      {/* Modals */}

      <OwnershipAction
        isOpen={showOwnershipAction}
        onClose={() => setShowOwnershipAction(false)}
      />

      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={async () => {
          await toTrashCiphers([selectedCipher.id])
          let routeName = await getRouteName()
          if (routeName.endsWith('__info')) {
            navigation.goBack()
          }
        }}
        title="Move to trash"
        desc="This item will be moved to trash where you can restore or pernamently delete it."
        btnText="Ok"
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
                      style={{ fontSize: 12 }}
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
              name="Clone"
              icon="clone"
              action={() => {
                onClose()
                navigation.navigate(`${cipherMapper.path}__edit`, { mode: 'clone' })
              }}
            />

            <ActionItem
              name="Move to Folder"
              icon="folder-o"
              action={() => {
                onClose()
                navigation.navigate('folders__select', {
                  mode: 'move', 
                  initialId: selectedCipher.folderId,
                  cipherIds: [selectedCipher.id]
                })
              }}
            />

            <ActionItem
              name="Change Ownership"
              icon="user-o"
              action={() => {
                onClose()
                setTimeout(() => setShowOwnershipAction(true), 100)
              }}
            />

            <Divider borderColor={color.line}  marginY={1} />

            <ActionItem
              name="Edit"
              icon="edit"
              action={() => {
                onClose()
                navigation.navigate(`${cipherMapper.path}__edit`, { mode: 'edit' })
              }}
            />

            <ActionItem
              name="Share"
              icon="share-square-o"
            />

            <ActionItem
              name="Move to Trash"
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
