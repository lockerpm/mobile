import React, { useState, useEffect, FC } from 'react'
import { View, FlatList } from 'react-native'
import { observer } from 'mobx-react-lite'
import { AppStackScreenProps } from 'app/navigators'
import { useStores } from 'app/models'
import { useFolder, useHelper } from 'app/services/hook'
import { CollectionView } from 'core/models/view/collectionView'
import { SharedGroupType, SharedMemberType } from 'app/static/types'
import { Header, Screen, Text, Button } from 'app/components/cores'
import { AddUserShareFolderModal } from './ShareUserModal'
import { SharedUsers } from './SharedUser'

export const FolderSharedUsersManagementScreen: FC<AppStackScreenProps<'shareFolder'>> = observer(
  (props) => {
    const navigation = props.navigation
    const route = props.route

    const { cipherStore, collectionStore } = useStores()
    const { notifyApiError, translate } = useHelper()
    const { shareFolderRemoveMember } = useFolder()
    const collection: CollectionView = collectionStore.collections.find(
      (c) => c.id === route.params.collectionId
    )
    // ----------------------- PARAMS -----------------------

    const [reload, setReload] = useState<boolean>(true)
    const [sharedUsers, setSharedUsers] = useState<SharedMemberType[]>([])
    const [showSelectUserModal, setShowSelectUserModal] = useState(false)

    const [sharedGroups, setSharedGroups] = useState<SharedGroupType[]>([])

    const data = (() => {
      const data = []
      sharedGroups.forEach((e) => {
        data.push({
          type: 'group',
          ...e,
        })
      })
      sharedUsers.forEach((e) => {
        data.push({
          type: 'user',
          ...e,
        })
      })
      return data
    })()

    // ----------------------- METHODS -----------------------

    const getSharedUsers = async () => {
      const res = await cipherStore.loadMyShares()
      if (res.kind !== 'ok') {
        notifyApiError(res)
      }
      const share = cipherStore.myShares.find((s) => s.id === collection.organizationId)
      if (share) {
        if (share.members.length > 0) setSharedUsers(share.members)

        if (share.groups.length > 0) setSharedGroups(share.groups)

        return share.members?.length + share.groups?.length
      }
      return 0
    }

    const onRemove = async (collection: CollectionView, id: string, isGroup?: boolean) => {
      const res = await shareFolderRemoveMember(collection, id, isGroup)
      if (res.kind === 'ok' || res.kind === 'unauthorized') {
        const sharedUserCount = await getSharedUsers()
        if (sharedUserCount === 0) {
          navigation.goBack()
        }
      }
    }

    // ----------------------- EFFECT -----------------------
    useEffect(() => {
      getSharedUsers()
    }, [showSelectUserModal, reload])

    // ----------------------- RENDER -----------------------
    return (
      <Screen
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={() => {
              navigation.goBack()
            }}
            title={translate('shares.share_folder.manage_user')}
          />
        }
        contentContainerStyle={{ flex: 1 }}
      >
        <AddUserShareFolderModal
          isOpen={showSelectUserModal}
          folder={collection}
          onClose={() => {
            setShowSelectUserModal(false)
          }}
          sharedUsers={sharedUsers}
          isLoading={reload}
        />

        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text preset="bold" text={translate('shares.share_folder.share_with')} />
            <Button
              preset="teriatary"
              onPress={() => {
                setShowSelectUserModal(true)
              }}
              text={translate('common.add')}
            />
          </View>
        </View>

        <FlatList
          style={{ padding: 16 }}
          scrollEnabled={true}
          data={data}
          keyExtractor={(_, index) => String(index)}
          ListEmptyComponent={() => (
            <View>
              <Text text={translate('shares.share_folder.no_shared_users')} />
            </View>
          )}
          renderItem={({ item }) => (
            <SharedUsers
              reload={reload}
              setReload={setReload}
              item={item}
              collection={collection}
              onRemove={onRemove}
            />
          )}
        />
      </Screen>
    )
  }
)
