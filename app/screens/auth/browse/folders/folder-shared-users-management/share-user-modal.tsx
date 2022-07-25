import React, { useEffect, useState } from "react"
import { View, TouchableOpacity, TextInput, Image, Modal } from "react-native"
import { Button, Text } from "../../../../../components"
import { useStores } from "../../../../../models"
import { commonStyles } from "../../../../../theme"
import { useMixins } from "../../../../../services/mixins"
import Entypo from 'react-native-vector-icons/Entypo'
import { AppEventType, EventBus } from "../../../../../utils/event-bus"
import { CollectionView } from "../../../../../../core/models/view/collectionView"
import { FolderView } from "../../../../../../core/models/view/folderView"
import { AccountRoleText } from "../../../../../config/types"
import { useFolderMixins } from "../../../../../services/mixins/folder"


interface InviteProps {
    isOpen: boolean
    folder?: FolderView | CollectionView
    onClose: () => void
    sharedUsers?: any[]
    isLoading?: boolean
}

export const AddUserShareFolderModal = (props: InviteProps) => {
    const { isOpen, onClose, sharedUsers, folder } = props
    const { user } = useStores()
    const { translate, color, notify } = useMixins()
    const { shareFolder, shareFolderAddMember } = useFolderMixins()


    // ----------------------- PARAMS -----------------------

    const [email, setEmail] = useState<string>("");
    const [emails, setEmails] = useState<string[]>([]);

    // ----------------------- METHODS -----------------------

    const addEmailToShare = (email: string) => {
        const e = email.trim().toLowerCase();
        if (!e) return;

        const isOwner = user?.email === e
        const isIncluded = sharedUsers?.some(element => element.email === e)
        if (!emails.includes(e) && !isOwner && !isIncluded) {
            setEmails([...emails, e])
            setEmail("")
        }
    }

    const removeEmailFromList = (val: string) => {
        setEmails(emails.filter(e => e !== val))
    }

    const addFolderMember = async (emails?: string[]) => {
        let res
        if (folder instanceof CollectionView) {
            res = await shareFolderAddMember(folder, emails, AccountRoleText.MEMBER, true)
        } else {
            res = await shareFolder(folder, emails, AccountRoleText.MEMBER, true)
        }

        onClose()
        if (res.kind === 'ok' || res.kind === 'unauthorized') {
            if (res.kind === 'ok') {
                notify("success", translate("shares.share_folder.success.shared"))
                setEmails([])
            }
        }

    }

    // ----------------------- EFFECTS -----------------------

    // Close on signal
    useEffect(() => {
        const listener = EventBus.createListener(AppEventType.CLOSE_ALL_MODALS, () => {
            onClose()
        })
        return () => {
            EventBus.removeListener(listener)
        }
    }, [])

    // ----------------------- RENDER -----------------------
    return (
        <Modal
            presentationStyle="pageSheet"
            visible={isOpen}
            animationType="slide"
            onRequestClose={() => onClose()}
        >
            <View style={[commonStyles.SECTION_PADDING, { flex: 1 }]}>
                <View style={{
                    marginTop: 10,
                    height: 40,
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "space-between"
                }} >
                    <TouchableOpacity
                        onPress={() => onClose()}>
                        <Image
                            source={require("./cross.png")}
                            style={{ height: 18, width: 18 }} />
                    </TouchableOpacity>
                    <Button
                        preset="link"
                        disabled={emails?.length < 1}
                        onPress={() => {
                            addFolderMember(emails);
                        }}>
                        <Text
                            text={translate('common.done')}
                            style={{
                                color: (emails?.length > 0) ? color.primary : color.block
                            }} />
                    </Button>
                </View>

                <View style={{ marginTop: 8 }}>
                    <Text preset="header" text={translate('shares.share_folder.select_member')} />
                </View>

                <View style={{
                    borderBottomColor: '#F2F2F5',
                    borderBottomWidth: 1,
                }}>
                    <View style={{
                        width: "100%",
                        flexDirection: "row",
                    }}>
                        <TouchableOpacity
                            onPress={() => {
                                addEmailToShare(email)
                            }}
                            style={{ marginRight: 16, marginVertical: 16 }}
                        >
                            <Image
                                source={require("./userPlus.png")}
                                style={{ height: 24, width: 24 }} />
                        </TouchableOpacity>
                        <TextInput
                            placeholder={translate('shares.share_folder.add_email')}
                            placeholderTextColor={color.text}
                            selectionColor={color.primary}
                            onChangeText={setEmail}
                            value={email}
                            clearButtonMode="unless-editing"
                            clearTextOnFocus={true}
                            onSubmitEditing={() => {
                                addEmailToShare(email)
                            }}
                            style={{
                                color: color.textBlack
                            }}
                        >
                        </TextInput>

                    </View>
                    <View>
                        {
                            emails.map((e, index) => {
                                return (
                                    <View
                                        key={index}
                                        style={{
                                            borderRadius: 8,
                                            borderWidth: 0.5,
                                            borderColor: color.block,
                                            backgroundColor: color.block,
                                            paddingLeft: 10,
                                            marginBottom: 16,
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            paddingVertical: 4
                                        }}
                                    >
                                        <Text
                                            preset="black"
                                            text={e}
                                        />

                                        <TouchableOpacity
                                            onPress={() => removeEmailFromList(e)}
                                            style={{
                                                paddingHorizontal: 12,
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Entypo name="circle-with-cross" size={20} color={color.textBlack} />
                                        </TouchableOpacity>
                                    </View>
                                )
                            })
                        }

                    </View>
                </View>


                <View style={{ marginTop: 20, marginBottom: 20 }}>
                    <Text>{translate('invite_member.select_person')}</Text>
                </View>
                {
                    email?.length > 0 &&
                    <TouchableOpacity onPress={() => addEmailToShare(email)}>
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
                                source={require("./avatar.png")}
                                style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
                            />

                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text
                                    preset="black"
                                    text={email}></Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                }
            </View>
        </Modal >
    )
}

