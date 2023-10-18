import React, { useState } from 'react'
import { View, Image } from 'react-native'
import { DeleteConfirmModal } from '../../../screens/auth/browse/trash/DeleteConfirmModal'
import { useCipherData, useCipherHelper, useHelper } from 'app/services/hook'
import { useStores } from 'app/models'
import { ActionSheet } from '../actionsSheet/ActionSheet'
import { Text } from 'app/components/cores'
import { CipherType } from 'core/enums'
import { ActionItem } from '../actionsSheet/ActionSheetItem'
import { useTheme } from 'app/services/context'

export interface DeletedActionProps {
  children?: React.ReactNode
  isOpen?: boolean
  onClose?: () => void
  navigation: any
}

/**
 * Describe your component here
 */
export const DeletedAction = (props: DeletedActionProps) => {
  const { navigation, isOpen, onClose, children } = props

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [nextModal, setNextModal] = useState<'deleteConfirm' | null>(null)

  const { colors } = useTheme()
  const { getRouteName, translate } = useHelper()
  const { deleteCiphers, restoreCiphers } = useCipherData()
  const { getCipherInfo } = useCipherHelper()
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
      const routeName = await getRouteName()
      if (routeName.endsWith('__info')) {
        navigation.goBack()
      }
    }
  }

  const handleDelete = async () => {
    const res = await deleteCiphers([selectedCipher.id])
    if (res.kind === 'ok') {
      const routeName = await getRouteName()
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
      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title={translate('trash.perma_delete')}
        desc={translate('trash.perma_delete_desc')}
        btnText="OK"
      />

      <ActionSheet
        isOpen={isOpen}
        onClose={handleActionSheetClose}
        header={
          <View style={{ width: '100%', paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Image source={cipherMapper.img} resizeMode='contain' style={{ height: 40, width: 40, borderRadius: 8 }} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text preset="bold" text={selectedCipher.name} numberOfLines={2} />
                {selectedCipher.type === CipherType.Login && !!selectedCipher.login.username && (
                  <Text preset="label" size="base" text={selectedCipher.login.username} />
                )}
              </View>
            </View>
          </View>
        }
      >
        {children}

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
          color={colors.error}
          action={() => {
            setNextModal('deleteConfirm')
            onClose()
          }}
        />
      </ActionSheet>
    </View>
  )
}
