import React, { useState, useEffect } from "react"
import { View, Alert, FlatList } from "react-native"
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
// import { FamilyMemberProp, Member } from "./member"
// import { InviteMemberModal } from "./invite-modal"


type ShareFolderScreenProp = RouteProp<PrimaryParamList, 'shareFolder'>;


export const FolderSharedUsersManagementScreen = observer(function FolderSharedUsersManagementScreen() {
    const navigation = useNavigation()
    const { cipherStore, collectionStore } = useStores()
    const route = useRoute<ShareFolderScreenProp>()
    const { translate, color } = useMixins()
    const collection: CollectionView = collectionStore.collections.find(c => c.id === route.params.collectionId)
    // ----------------------- PARAMS -----------------------

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sharedUsers, setSharedUsers] = useState<SharedMemberType[]>([]);
    const [showSelectUserModal, setShowSelectUserModal] = useState(false)

    // ----------------------- METHODS -----------------------

    const getSharedUsers = async () => {
        const share = cipherStore.myShares.find(s => s.id === collection.organizationId)
        if (share && share.members.length > 0) {
            console.log(share.members)
            setSharedUsers(share.members)
        }
    }

    // ----------------------- EFFECT -----------------------
    useEffect(() => {
        getSharedUsers()
    })

    // ----------------------- RENDER -----------------------
    return (
        <Layout
            noScroll
            header={(
                <Header
                    goBack={() => {
                        navigation.goBack()
                    }}
                    title={"Share"}
                    right={(<View style={{ width: 30 }} />)}
                />
            )}
        >
            <AddUserShareFolderModal
                isOpen={showSelectUserModal}
                folder={collection}
                onClose={() => {
                    setShowSelectUserModal(false);
                }}
                sharedUsers={sharedUsers}
                isLoading={isLoading} />

            <View style={commonStyles.SECTION_PADDING}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 20 }}>
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
                <View style={{ backgroundColor: color.background, marginTop: 16 }}>
                    <FlatList
                        data={sharedUsers}
                        keyExtractor={(_, index) => String(index)}
                        renderItem={({ item }) => (
                            <View>
                                <SharedUsers
                                    users={item}
                                />
                            </View>
                        )}
                    />
                </View>
            </View>
        </Layout >
    )
})
