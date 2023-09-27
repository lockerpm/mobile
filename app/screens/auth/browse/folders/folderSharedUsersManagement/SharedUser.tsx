import { useTheme } from 'app/services/context'
import { useCipherData } from 'app/services/hook'
import { AccountRoleText, SharedGroupType, SharedMemberType, SharingStatus } from 'app/static/types'
import { CollectionView } from 'core/models/view/collectionView'
import React, { useState } from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import { Icon, Text } from 'app/components/cores'
import { translate } from 'app/i18n'
import { ActionItem, ActionSheet } from 'app/components/ciphers'

interface Props {
  reload: boolean
  setReload: (val: boolean) => void
  item?: (SharedMemberType | SharedGroupType) & { type: string }
  collection: CollectionView
  onRemove: (collection: CollectionView, id: string, isGroup?: boolean) => void
}

export const SharedUsers = (props: Props) => {
  const { item, collection, reload, setReload, onRemove } = props

  const { colors } = useTheme()
  const { editShareCipher } = useCipherData()

  const isEditable = item.role === 'admin'

  const onEditRole = async (shareType: 'only_fill' | 'edit') => {
    let role = AccountRoleText.MEMBER
    let autofillOnly = false
    switch (shareType) {
      case 'only_fill':
        autofillOnly = true
        break
      case 'edit':
        role = AccountRoleText.ADMIN
        break
    }
    const res = await editShareCipher(
      collection.organizationId,
      item.id,
      role,
      autofillOnly,
      item.type === 'group'
    )
    if (res.kind === 'ok' || res.kind === 'unauthorized') {
      setShowSheetModal(false)
      setReload(!reload)
    }
  }

  // ----------------------- PARAMS -----------------------
  const [showSheetModal, setShowSheetModal] = useState<boolean>(false)

  // ----------------------- RENDER -----------------------
  return (
    <View
      style={{
        borderBottomColor: colors.block,
        borderBottomWidth: 1,
        width: '100%',
        flexDirection: 'row',
        marginBottom: 15,
        paddingVertical: 14,
        justifyContent: 'flex-start',
      }}
    >
      <Image
        source={item.avatar ? { uri: item.avatar } : require('./group.png')}
        style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
      />

      <TouchableOpacity
        style={{ flex: 1, justifyContent: 'center' }}
        onPress={() => setShowSheetModal(true)}
      >
        <Text text={item.email || item.name} />
        <View style={{ flexDirection: 'row' }}>
          <Text
            preset="default"
            text={
              !isEditable
                ? translate('shares.share_type.view')
                : translate('shares.share_type.edit')
            }
          />
          {/* Sharing status */}
          {item.status && (
            <View
              style={{
                alignSelf: 'center',
                marginLeft: 10,
                paddingHorizontal: 10,
                paddingVertical: 2,
                backgroundColor:
                  item.status === SharingStatus.INVITED
                    ? colors.warning
                    : item.status === SharingStatus.ACCEPTED
                    ? colors.title
                    : colors.primary,
                borderRadius: 3,
              }}
            >
              <Text
                size="small"
                text={item.status.toUpperCase()}
                style={{
                  fontWeight: 'bold',
                  color: colors.background,
                }}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>

      <ActionSheet
        isOpen={showSheetModal}
        onClose={() => setShowSheetModal(false)}
        header={
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              <Image
                source={item.avatar ? { uri: item.avatar } : require('./group.png')}
                style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
              />

              <View style={{ justifyContent: 'center', height: 40, marginLeft: 16 }}>
                {item.full_name && <Text>{item.full_name}</Text>}
                <Text preset={item.name ? 'default' : 'label'}>{item.email || item.name}</Text>
              </View>
            </View>
          </View>
        }
      >
        <ActionItem
          containerStyle={{ backgroundColor: !isEditable && colors.block }}
          action={() => {
            onEditRole('only_fill')
          }}
          icon="eye"
          disabled={!isEditable}
          name={translate('shares.share_folder.viewer')}
        />

        <ActionItem
          containerStyle={{ backgroundColor: isEditable && colors.block }}
          action={() => {
            onEditRole('edit')
          }}
          icon="edit"
          disabled={isEditable}
          name={translate('shares.share_folder.editor')}
        />

        <ActionItem
          action={() => {
            onRemove(collection, item.id, item.type === 'group')
            setShowSheetModal(false)
          }}
          icon="user-minus"
          color={colors.error}
          name={translate('shares.share_folder.remove')}
        />
      </ActionSheet>
    </View>
  )
}
