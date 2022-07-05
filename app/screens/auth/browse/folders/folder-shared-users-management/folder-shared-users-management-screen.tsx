import React, { useState, useEffect } from "react"
import { View, Alert, FlatList } from "react-native"
import { Button, Layout, Text, Header } from "../../../../../components"
import { useStores } from "../../../../../models"
import { observer } from "mobx-react-lite"
import { commonStyles } from "../../../../../theme"
import { useMixins } from "../../../../../services/mixins"
import { useNavigation } from "@react-navigation/native"
// import { FamilyMemberProp, Member } from "./member"
// import { InviteMemberModal } from "./invite-modal"

export const FolderSharedUsersManagementScreen = observer(function FolderSharedUsersManagementScreen() {
    const navigation = useNavigation()
    const { user } = useStores()
    const { translate, color, notifyApiError, notify } = useMixins()

    // ----------------------- PARAMS -----------------------
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sharedUsers, setSharedUsers] = useState<any[]>([]);
    const [showSelectUserModal, setShowSelectUserModal] = useState(false)

    // ----------------------- METHODS -----------------------
    const getSharedUsers = async () => {
        // const res = await user.getFamilyMember()
        // if (res.kind === "ok") {
        //     setFamilyMembers(res.data)
        // } else {
        //     notifyApiError(res)
        // }
    }

    // const comfirmRemoveMember = async (id: string) => {
    //     Alert.alert(
    //         translate("invite_member.confirm"), "",
    //         [
    //             {
    //                 text: translate("common.yes"),
    //                 onPress: () => {
    //                     removeFamilyMember(id)
    //                 },
    //                 style: "destructive"
    //             },
    //             {
    //                 text: translate("common.cancel"),
    //                 onPress: () => { },
    //                 style: "cancel"
    //             }
    //         ],
    //         {
    //             cancelable: true
    //         }
    //     )
    // }
    // const removeFamilyMember = async (id: string) => {
    //     const res = await user.removeFamilyMember(id)
    //     if (res.kind === "ok") {
    //         setRelad(true)
    //         notify("success", translate("invite_member.delete_noti"))
    //     } else {
    //         notifyApiError(res)
    //     }
    // }
    // ----------------------- EFFECT -----------------------

    // ----------------------- RENDER -----------------------
    return (
        <Layout
            header={(
                <Header
                    goBack={() => {
                        navigation.goBack()
                    }}
                    title={"Shared"}
                    right={(<View style={{ width: 30 }} />)}
                />
            )}
        >
            <View style={[commonStyles.SECTION_PADDING, { backgroundColor: color.background }]}>
                <View>
                    {/* <InviteMemberModal
                        isShow={showInviteMemberModal}
                        onClose={setShowInviteMemberModal}
                        familyMembers={familyMembers} 
                        setRelad={setRelad}/> */}

                    <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                        <Text
                            preset="semibold"
                            style={{ marginBottom: 20 }}
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

                    <FlatList 
                        data={sharedUsers}
                        keyExtractor={(_, index) => String(index)}
                        renderItem={({item}) => (
                            <View>

                            </View>
                        )}
                    />
                </View>
            </View>
        </Layout >
    )
})
