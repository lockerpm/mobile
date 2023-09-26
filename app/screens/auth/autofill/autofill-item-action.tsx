import React, { useState } from 'react'
import { View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { commonStyles, fontSize } from '../../../theme'
import { useStores } from '../../../models'
import { BROWSE_ITEMS } from '../../../common/mappings'
import { CipherType } from '../../../../core/enums'
import { useMixins } from '../../../services/mixins'
import { DeleteConfirmModal } from '../browse/trash/DeleteConfirmModal'
import { CipherView } from '../../../../core/models/view'
import { useCipherDataMixins } from '../../../services/mixins/cipher/data'
import {
  ActionItem,
  ActionSheet,
  ActionSheetContent,
  AutoImage as Image,
  Divider,
  Text,
} from '../../../components'
import { AccountRoleText } from '../../../config/types'

interface Props {
  isOpen?: boolean
  onClose?: () => void
  navigation: any
  onLoadingChange?: Function
}

/**
 * Describe your component here
 */
export const AutoFillItemAction = observer(function AutoFillItemAction(props: Props) {
  const { navigation, isOpen, onClose } = props

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [nextModal, setNextModal] = useState<'trashConfirm' | null>(null)

  const { translate, getTeam, getWebsiteLogo, color, copyToClipboard } = useMixins()
  const { toTrashCiphers } = useCipherDataMixins()
  const { cipherStore, user, uiStore } = useStores()
  const selectedCipher: CipherView = cipherStore.cipherView

  // Computed

  const teamUser = getTeam(user.teams, selectedCipher.organizationId)
  const editable = !selectedCipher.organizationId || teamUser.role !== AccountRoleText.MEMBER

  const cipherMapper = (() => {
    return {
      img: selectedCipher.login.uri
        ? getWebsiteLogo(selectedCipher.login.uri)
        : BROWSE_ITEMS.password.icon,
      backup: BROWSE_ITEMS.password.icon,
      path: 'passwords',
    }
  })()

  // Methods

  const handleDelete = async () => {
    await toTrashCiphers([selectedCipher.id])
  }

  const handleActionSheetClose = () => {
    onClose()
    switch (nextModal) {
      case 'trashConfirm':
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
        title={translate('trash.to_trash')}
        desc={translate('trash.to_trash_desc')}
        btnText="OK"
      />

      {/* Modals end */}

      {/* Actionsheet */}
      <ActionSheet isOpen={isOpen} onClose={handleActionSheetClose}>
        <View style={{ width: '100%', paddingHorizontal: 20 }}>
          <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
            <Image
              source={cipherMapper.img}
              backupSource={cipherMapper.backup}
              style={{ height: 40, width: 40, borderRadius: 8 }}
            />
            <View style={{ marginLeft: 10 }}>
              <Text preset="semibold" text={selectedCipher.name} />
              {selectedCipher.type === CipherType.Login && !!selectedCipher.login.username && (
                <Text text={selectedCipher.login.username} style={{ fontSize: fontSize.small }} />
              )}
            </View>
          </View>
        </View>

        <Divider style={{ marginTop: 10 }} />

        <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
          <ActionItem
            name={translate('password.copy_username')}
            icon="copy"
            action={() => copyToClipboard(selectedCipher.login.username)}
            disabled={!selectedCipher.login.username}
          />

          <ActionItem
            name={translate('password.copy_password')}
            icon="copy"
            action={() => copyToClipboard(selectedCipher.login.password)}
            disabled={!selectedCipher.login.password || !selectedCipher.viewPassword}
          />

          <Divider style={{ marginVertical: 5 }} />

          <ActionItem
            disabled={!editable || (uiStore.isOffline && !!selectedCipher.organizationId)}
            name={translate('common.edit')}
            icon="edit"
            action={() => {
              onClose()
              navigation.navigate(`${cipherMapper.path}__edit`, { mode: 'edit' })
            }}
          />

          <ActionItem
            disabled={!editable || (uiStore.isOffline && !!selectedCipher.organizationId)}
            name={translate('trash.to_trash')}
            icon="trash"
            textColor={color.error}
            action={() => {
              setNextModal('trashConfirm')
              onClose()
            }}
          />
        </ActionSheetContent>
      </ActionSheet>
      {/* Actionsheet end */}
    </View>
  )
})
