import React, { useState } from "react"
import { View, Image, TouchableOpacity } from "react-native"
import { Text } from "../../../../components"
import Feather from 'react-native-vector-icons/Feather'
import { useMixins } from "../../../../services/mixins"
import { ActionSheet, ActionSheetContent } from "../../../../components"



export interface FamilyMemberProp {
    id?: number
    email: string
    avatar?: string
    created_time?: string
    username?: string
    full_name?: string
}


interface MemberProps {
    member: FamilyMemberProp
    familyOwner?: boolean
    add?: boolean
    onRemove?: (id: string) => Promise<void>
}

export const Member = (props: MemberProps) => {
    const { member, familyOwner, add, onRemove } = props
    const { id, email, avatar, created_time, username, full_name } = member
    const { color, translate } = useMixins()
    // ----------------------- PARAMS -----------------------
    const [showSheetModal, setShowSheetModal] = useState<boolean>(false)


    // ----------------------- RENDER -----------------------
    return (
        <View
            style={
                {
                    width: "100%",
                    flexDirection: "row",
                    marginBottom: 15,
                    paddingVertical: 14,
                    justifyContent: "flex-start"
                }
            }>
            <Image
                source={avatar ? { uri: avatar } : require("./avatar.png")}
                style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
            />

            <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text
                    preset="black"
                    text={email}
                />
                {familyOwner && <Text
                    preset="default"
                    text={"Family Owner"}
                    style={{ color: color.primary }}
                />}
            </View>

            {!add && !familyOwner && <TouchableOpacity
                onPress={() => setShowSheetModal(true)}
                style={{ justifyContent: 'center' }}>
                <Feather
                    name="more-horizontal"
                    size={18}
                    color={"black"}
                />
            </TouchableOpacity>}

            <ActionSheet
                isOpen={showSheetModal}
                onClose={() => setShowSheetModal(false)}>
                <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
                    <View style={{ alignItems: "center" }}>
                        <Image
                            source={avatar ? { uri: avatar } : require("./avatar.png")}
                            style={{ height: 40, width: 40, borderRadius: 20 }}
                        />
                        <Text style={{ marginVertical: 20 }}>{email}</Text>
                        <View style={{ borderBottomColor: color.block, borderWidth: 0.3, width: "100%", marginVertical:2 }}></View>
                        <TouchableOpacity
                            onPress={() => {
                                setShowSheetModal(false)
                                onRemove(id.toString());
                            }}
                            style={{ justifyContent: 'center' }}>
                            <Text style={{ marginVertical: 20, color: "red" }}>{translate("invite_member.remove")}</Text>
                        </TouchableOpacity>
                    </View>
                </ActionSheetContent>
            </ActionSheet>

            
        </View >
    )
}
