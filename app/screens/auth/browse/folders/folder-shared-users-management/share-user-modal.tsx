import React, { useEffect, useState } from "react"
import { View, TouchableOpacity, TextInput, Image } from "react-native"
import { Button, Text } from "../../../../../components"
import { useStores } from "../../../../../models"
import { observer } from "mobx-react-lite"
import { commonStyles } from "../../../../../theme"
import { Modal } from "react-native-ui-lib"
import { useMixins } from "../../../../../services/mixins"
import { SharedUsers } from "./shared-user"
import { FAMILY_MEMBER_LIMIT } from "../../../../../config/constants"
import Entypo from 'react-native-vector-icons/Entypo'
import { AppEventType, EventBus } from "../../../../../utils/event-bus"


interface InviteProps {
    isShow: boolean
    onClose: () => void
    sharedUsers?: any[]
    isLoading?: boolean
}
export const ShareUserModal = observer(function ShareUserModal(props: InviteProps) {
    const { isShow, onClose, sharedUsers, isLoading } = props
    const { user } = useStores()
    const { translate, color, notifyApiError, notify } = useMixins()

    // ----------------------- PARAMS -----------------------
    const [email, setEmail] = useState<string>("");
    const [emails, setEmails] = useState<string[]>([]);


    // ----------------------- METHODS -----------------------
    const addEmailToInviteList = (email: string) => {
        const e = email.trim().toLowerCase();
        if (!e) return;

        const unreachLimit = sharedUsers.length + emails.length < FAMILY_MEMBER_LIMIT
        if (!unreachLimit) return;

        const isOwner = user?.email === e
        const isIncluded = sharedUsers.some(element => element.email === e)

        if (!emails.includes(e) && !isOwner && !isIncluded) {
            setEmails([...emails, e])
            setEmail("")
        }
    }
    const removeEmailFromInviteList = (val: string) => {
        setEmails(emails.filter(e => e !== val))
    }

    const addFamilyMember = async (emails?: string[]) => {
        // const res = await user.addFamilyMember(emails)
        // onClose()
        // if (res.kind === "ok") {
        //     notify("success", translate("invite_member.add_noti"))
        //     setEmails([])
        //     // setRelad(true)
        // } else {
        //     notifyApiError(res)
        // }
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
            visible={isShow}
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
                        disabled={emails.length < 1}
                        onPress={() => {
                            addFamilyMember(emails);
                        }}>
                        <Text
                            text="Add"
                            style={{
                                color: (emails.length > 0) ? "#007AFF" : color.block
                            }} />
                    </Button>
                </View>

                <View style={{ marginTop: 8 }}>
                    <Text preset="header" text="Shared this folder with"/>
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
                                addEmailToInviteList(email)
                            }}
                            style={{ marginRight: 16, marginVertical: 16 }}
                        >
                            <Image
                                source={require("./userPlus.png")}
                                style={{ height: 24, width: 24 }} />
                        </TouchableOpacity>
                        <TextInput
                            placeholder={"Add email to share"}
                            placeholderTextColor={color.text}
                            selectionColor={color.primary}
                            onChangeText={setEmail}
                            value={email}
                            clearButtonMode="unless-editing"
                            clearTextOnFocus={true}
                            onSubmitEditing={() => {
                                addEmailToInviteList(email)
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
                                            onPress={() => removeEmailFromInviteList(e)}
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
                    email.length > 0 &&
                    <TouchableOpacity onPress={() => addEmailToInviteList(email)}>
                        <SharedUsers users={{ email: email }} add={true} />
                    </TouchableOpacity>
                }
            </View>
        </Modal >
    )
})
