import React, { useState, useEffect } from "react"
import { View, Alert, FlatList } from "react-native"
import { Button, Layout, Text, Header } from "../../../../../components"
import { useStores } from "../../../../../models"
import { observer } from "mobx-react-lite"
import { useMixins } from "../../../../../services/mixins"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { ShareUserModal } from "./share-user-modal"
import { SharedUsers, SharedUser } from "./shared-user"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data"
import { FolderView } from "../../../../../../core/models/view/folderView"
import { CollectionView } from "../../../../../../core/models/view/collectionView"
import { AccountRoleText } from "../../../../../config/types"
// import { FamilyMemberProp, Member } from "./member"
// import { InviteMemberModal } from "./invite-modal"


type ShareFolderScreenProp = RouteProp<PrimaryParamList, 'shareFolder'>;


export const FolderSharedUsersManagementScreen = observer(function FolderSharedUsersManagementScreen() {
    const navigation = useNavigation()
    const { user, folderStore } = useStores()
    const route = useRoute<ShareFolderScreenProp>()
    const { shareFolder } = useCipherDataMixins()
    const { translate, color } = useMixins()
    const folder: FolderView | CollectionView = folderStore.folders.find(f => f.id = route.params.id)
    // ----------------------- PARAMS -----------------------

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
    const [showSelectUserModal, setShowSelectUserModal] = useState(false)

    // ----------------------- METHODS -----------------------

    const test = async () => {
        let role = AccountRoleText.MEMBER
        let autofillOnly = false
        // switch (shareType) {
        //   case 'only_fill':
        //     autofillOnly = true
        //     break
        //   case 'edit':
        //     role = AccountRoleText.ADMIN
        //     break
        // }
        const res = await shareFolder(folder, ["thinh.nn3386@gmail.com"], role, autofillOnly)
        console.log(res)
    }

    const getSharedUsers = async () => {

        const testData = [
            {
                id: null,
                email: "thinh.nn1211@gmail.com",
                avatar: user.avatar
            },
            {
                id: null,
                email: "thinh.nn3386@gmail.com",
                avatar: user.avatar
            }
        ]
        setSharedUsers(testData)

    }

    const comfirmRemoveSharedUser = async (id: string) => {
        Alert.alert(
            "test", "",
            [
                {
                    text: translate("common.yes"),
                    onPress: () => {
                        onRemove(id)
                    },
                    style: "destructive"
                },
                {
                    text: translate("common.cancel"),
                    onPress: () => { },
                    style: "cancel"
                }
            ],
            {
                cancelable: true
            }
        )
    }
    const onRemove = async (id: string) => {

    }
    const onEditRole = async (id: string) => {

    }
    // ----------------------- EFFECT -----------------------
    useEffect(() => {
        getSharedUsers()
    }, [])

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

            <Button onPress={test} text="test" />
            <ShareUserModal
                isShow={showSelectUserModal}
                onClose={() => {
                    setShowSelectUserModal(false);
                }}
                sharedUsers={sharedUsers}
                isLoading={isLoading} />

            <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                <Text
                    preset="semibold"
                    text="This folder has been shared with"
                />
                <Button
                    preset="link"
                    onPress={() => {
                        setShowSelectUserModal(true);
                    }}
                    text="Add"
                />
            </View>
            <View style={{ backgroundColor: color.background, marginTop: 35 }}>


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
        </Layout >
    )
})
