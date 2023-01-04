import React, { useState } from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import { ActionItem, Icon, Text, ActionSheet, ActionSheetContent } from '../../../../../components'
import { useMixins } from '../../../../../services/mixins'
import { AccountRoleText, SharingStatus } from '../../../../../config/types'
import { useCipherDataMixins } from '../../../../../services/mixins/cipher/data'
import { CollectionView } from '../../../../../../core/models/view/collectionView'
import { fontSize } from '../../../../../theme'
import { SharedGroupType, SharedMemberType } from '../../../../../config/types/api'

interface Props {
  reload: boolean
  setReload: (val: boolean) => void
  item?: (SharedMemberType | SharedGroupType) & { type: string }
  collection: CollectionView
  onRemove: (collection: CollectionView, id: string, isGroup?: boolean) => void
}

export const SharedUsers = (props: Props) => {
  const { item, collection, reload, setReload, onRemove } = props

  const { color, translate } = useMixins()
  const { editShareCipher } = useCipherDataMixins()

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
    const res = await editShareCipher(collection.organizationId, item.id, role, autofillOnly, item.type === 'group')
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
        borderBottomColor: color.block,
        borderBottomWidth: 1,
        width: '100%',
        flexDirection: 'row',
        marginBottom: 15,
        paddingVertical: 14,
        justifyContent: 'flex-start',
      }}
    >
      <Image
        source={item['avatar'] ? { uri: item['avatar'] } : require('./group.png')}
        style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
      />

      <TouchableOpacity
        style={{ flex: 1, justifyContent: 'center' }}
        onPress={() => setShowSheetModal(true)}
      >
        <Text preset="black" text={item['email'] || item['name']} />
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
          {item['status'] && (
            <View
              style={{
                alignSelf: 'center',
                marginLeft: 10,
                paddingHorizontal: 10,
                paddingVertical: 2,
                backgroundColor:
                  item['status'] === SharingStatus.INVITED
                    ? color.warning
                    : item['status'] === SharingStatus.ACCEPTED
                      ? color.info
                      : color.primary,
                borderRadius: 3,
              }}
            >
              <Text
                text={item['status'].toUpperCase()}
                style={{
                  fontWeight: 'bold',
                  color: color.background,
                  fontSize: fontSize.mini,
                }}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>

      <ActionSheet isOpen={showSheetModal} onClose={() => setShowSheetModal(false)}>
        <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              <Image
                source={item['avatar'] ? { uri: item['avatar'] } : require('./group.png')}
                style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
              />

              <View style={{ justifyContent: 'center', height: 40, marginLeft: 16 }}>
                {item['full_name'] && <Text preset="black">{item['full_name']}</Text>}
                <Text preset={!!item['name'] ? "black" : "default"}>{item['email'] || item['name']}</Text>
              </View>
            </View>
          </View>
          <ActionItem
            style={{ backgroundColor: !isEditable && color.block }}
            action={() => {
              onEditRole('only_fill')
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <View style={{ justifyContent: 'center' }}>
                <Icon icon="eye" size={24} color={color.textBlack} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text preset="black" text={translate('shares.share_folder.viewer')} />
                <Text text={translate('shares.share_folder.viewer_per')} />
              </View>
            </View>
          </ActionItem>

          <ActionItem
            style={{ backgroundColor: isEditable && color.block }}
            action={() => {
              onEditRole('edit')
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <View style={{ justifyContent: 'center' }}>
                <Icon icon="pencil-simple" size={24} color={color.textBlack} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text preset="black" text={translate('shares.share_folder.editor')} />
                <Text text={translate('shares.share_folder.editor_per')} />
              </View>
            </View>
          </ActionItem>

          <ActionItem
            action={() => {
              onRemove(collection, item.id, item.type === 'group')
              setShowSheetModal(false)
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <View style={{ justifyContent: 'center' }}>
                <Icon icon="user-minus" size={24} color={color.error} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text
                  text={translate('shares.share_folder.remove')}
                  style={{ color: color.error }}
                />
              </View>
            </View>
          </ActionItem>
        </ActionSheetContent>
      </ActionSheet>
    </View>
  )
}
