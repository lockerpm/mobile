import React, { useState, useEffect } from "react"
import { View, FlatList } from "react-native"
import { Button, Layout, Text, Header } from "../../../../../components"
import { useStores } from "../../../../../models"
import { observer } from "mobx-react-lite"
import { useMixins } from "../../../../../services/mixins"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { AddUserShareFolderModal } from "./share-user-modal"
import { SharedUsers } from "./shared-user"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { CollectionView } from "../../../../../../core/models/view/collectionView"
import { commonStyles } from "../../../../../theme"
import { SharedMemberType } from "../../../../../services/api"
import { useFolderMixins } from "../../../../../services/mixins/folder"


type ShareFolderScreenProp = RouteProp<PrimaryParamList, 'shareFolder'>;


export const FolderSharedUsersManagementScreen = observer(function FolderSharedUsersManagementScreen() {
    const navigation = useNavigation()
    const { cipherStore, collectionStore } = useStores()
    const route = useRoute<ShareFolderScreenProp>()
    const { translate, notifyApiError } = useMixins()
    const { shareFolderRemoveMember } = useFolderMixins()
    const collection: CollectionView = collectionStore.collections.find(c => c.id === route.params.collectionId)
    // ----------------------- PARAMS -----------------------

    const [reload, setReload] = useState<boolean>(true);
    const [sharedUsers, setSharedUsers] = useState<SharedMemberType[]>([]);
    const [showSelectUserModal, setShowSelectUserModal] = useState(false)

    // ----------------------- METHODS -----------------------

    const getSharedUsers = async () => {
        const res = await cipherStore.loadMyShares();
        if (res.kind !== 'ok') {
            notifyApiError(res)
        }

        const share = cipherStore.myShares.find(s => s.id === collection.organizationId)
        if (share && share.members.length > 0) {
            setSharedUsers(share.members)
            return share.members.length 
        } 
        return 0
    }

    const onRemove = async (collection: CollectionView, id: string) => {
        let res = await shareFolderRemoveMember(collection, id)
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
        <Layout
            noScroll
            header={(
                <Header
                    goBack={() => {
                        navigation.goBack()
                    }}
                    title={"Manage members"}
                    right={(<View style={{ width: 30 }} />)}
                />
            )}
            containerStyle={{ flex: 1 }}
        >
            <AddUserShareFolderModal
                isOpen={showSelectUserModal}
                folder={collection}
                onClose={() => {
                    setShowSelectUserModal(false);
                }}
                sharedUsers={sharedUsers}
                isLoading={reload} />

            <View style={commonStyles.SECTION_PADDING}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text
                        preset="semibold"
                        text={translate('shares.share_folder.share_with')}
                    />
                    <Button
                        preset="link"
                        onPress={() => {
                            setShowSelectUserModal(true);
                        }}
                        text={translate('common.add')}
                    />
                </View>
            </View>
            <FlatList
                style={commonStyles.SECTION_PADDING}
                scrollEnabled={true}
                data={sharedUsers}
                keyExtractor={(_, index) => String(index)}
                ListEmptyComponent={() => (
                    <View>
                        <Text text={translate('shares.share_folder.no_shared_users')}/>
                    </View>
                )}
                renderItem={({ item }) => (
                    <SharedUsers
                        reload={reload}
                        setReload={setReload}
                        user={item}
                        collection={collection}
                        onRemove={onRemove}
                    />
                )}
            />
        </Layout >
    )
})
