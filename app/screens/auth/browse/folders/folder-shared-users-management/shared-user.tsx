import React, { useState } from "react"
import { View, Image, TouchableOpacity, Alert } from "react-native"
import { ActionItem, Icon, Text } from "../../../../../components"
import { useMixins } from "../../../../../services/mixins"
import { ActionSheet, ActionSheetContent } from "../../../../../components"
import { SharedMemberType } from "../../../../../services/api"



interface Props {
    users: SharedMemberType
}

export const SharedUsers = (props: Props) => {
    const { users } = props
    const { id, email, avatar, full_name, share_type } = users
    const { color, translate } = useMixins()

    const owner = id === null
    const isEditable = share_type !== "View"
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

    // ----------------------- PARAMS -----------------------
    const [showSheetModal, setShowSheetModal] = useState<boolean>(false)

    // ----------------------- RENDER -----------------------
    return (
        <View
            style={
                {
                    borderBottomColor: color.block,
                    borderBottomWidth: 1,
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


            <TouchableOpacity style={{ flex: 1, justifyContent: 'center' }}
                onPress={() => setShowSheetModal(true)}
            >
                <Text
                    preset="black"
                    text={email}
                />
                <Text
                    preset="default"
                    text={!isEditable ? translate('shares.share_type.view') : translate('shares.share_type.edit')}
                />
            </TouchableOpacity>

            <ActionSheet
                isOpen={showSheetModal}
                onClose={() => setShowSheetModal(false)}>
                <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
                    <View style={{ paddingHorizontal: 20 }}>
                        <View style={{ flexDirection: "row", marginBottom: 16 }}>
                            <Image
                                source={avatar ? { uri: avatar } : require("./avatar.png")}
                                style={{ height: 40, width: 40, borderRadius: 20 }}
                            />
                            <View style={{ justifyContent: "center", height: 40, marginLeft: 16 }}>
                                {full_name && <Text preset="black" >{full_name}</Text>}
                                <Text >{email}</Text>
                            </View>
                        </View>

                    </View>
                    <ActionItem
                        style={{ backgroundColor: !isEditable && color.block }}
                        action={() => {
                        }}
                    >
                        <View style={{ flexDirection: "row" }}>
                            <View style={{ justifyContent: "center" }}>
                                <Icon icon="eye" size={24} />
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
                        }}
                    >
                        <View style={{ flexDirection: "row" }}>
                            <View style={{ justifyContent: "center" }}>
                                <Icon icon="pencil-simple" size={24} />
                            </View>
                            <View style={{ marginLeft: 12 }}>
                                <Text preset="black" text={translate('shares.share_folder.editor')} />
                                <Text text={translate('shares.share_folder.editor_per')} />
                            </View>
                        </View>
                    </ActionItem>

                    <ActionItem
                        action={() => {
                        }}
                    >
                        <View style={{ flexDirection: "row" }}>
                            <View style={{ justifyContent: "center" }}>
                                <Icon icon="user-minus" size={24} color={color.error} />
                            </View>
                            <View style={{ marginLeft: 12 }}>
                                <Text text={translate('shares.share_folder.remove')} style={{ color: color.error }} />
                            </View>
                        </View>
                    </ActionItem>
                </ActionSheetContent>
            </ActionSheet>


        </View >
    )
}

