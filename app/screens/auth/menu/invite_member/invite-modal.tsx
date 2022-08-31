import React, { useEffect, useState } from "react"
import { View, TouchableOpacity, TextInput, Image, Modal } from "react-native"
import { Button, Icon, Text } from "../../../../components"
import { useStores } from "../../../../models"
import { observer } from "mobx-react-lite"
import { commonStyles } from "../../../../theme"
// import { Modal } from "react-native-ui-lib"
import { useMixins } from "../../../../services/mixins"
import { Member } from "./member"
import { FAMILY_MEMBER_LIMIT } from "../../../../config/constants"
import Entypo from 'react-native-vector-icons/Entypo'
import { AppEventType, EventBus } from "../../../../utils/event-bus"


interface InviteProps {
    isShow: boolean
    onClose: React.Dispatch<React.SetStateAction<boolean>>
    familyMembers?: any
    setRelad?: any
}
export const InviteMemberModal = observer(function InviteMemberModal(props: InviteProps) {
    const { isShow, onClose, familyMembers, setRelad } = props
    const { user } = useStores()
    const { translate, color, notifyApiError, notify } = useMixins()

    // ----------------------- PARAMS -----------------------
    const [email, setEmail] = useState<string>("");
    const [emails, setEmails] = useState<string[]>([]);


    // ----------------------- METHODS -----------------------
    const addEmailToInviteList = (email: string) => {
        const e = email.trim().toLowerCase();
        if (!e) return;

        const unreachLimit = familyMembers.length + emails.length < FAMILY_MEMBER_LIMIT
        if (!unreachLimit) return;

        const isOwner = user?.email === e
        const isIncluded = familyMembers.some(element => element.email === e)

        if (!emails.includes(e) && !isOwner && !isIncluded) {
            setEmails([...emails, e])
            setEmail("")
        }
    }
    const removeEmailFromInviteList = (val: string) => {
        setEmails(emails.filter(e => e !== val))
    }

    const addFamilyMember = async (emails?: string[]) => {
        const res = await user.addFamilyMember(emails)
        onClose(false)
        if (res.kind === "ok") {
            notify("success", translate("invite_member.add_noti"))
            setEmails([])
            setRelad(true)
        } else {
            notifyApiError(res)
        }

    }

    // ----------------------- EFFECTS -----------------------

    // Close on signal
    useEffect(() => {
        const listener = EventBus.createListener(AppEventType.CLOSE_ALL_MODALS, () => {
            onClose(false)
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
            onRequestClose={() => onClose(!isShow)}
        >
            <View style={[commonStyles.SECTION_PADDING, { flex: 1, backgroundColor: color.background }]}>
                <View style={{
                    height: 40,
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "space-between"
                }} >
                    <TouchableOpacity
                        onPress={() => onClose(!isShow)}>
                        <Icon icon={"cross"} size={18} color={color.textBlack} />
                    </TouchableOpacity>
                    <Button
                        preset="link"
                        disabled={emails.length < 1}
                        onPress={() => {
                            addFamilyMember(emails);
                        }}>
                        <Text style={{
                            color: (emails.length > 0) ? color.primary : color.block
                        }}>{translate('invite_member.action')}</Text>
                    </Button>
                </View>

                <View style={{ marginTop: 12 }}>
                    <Text preset="header">{translate('invite_member.title')}</Text>
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
                            <Icon icon={"user-plus"} size={24} color={color.textBlack} />
                        </TouchableOpacity>
                        <TextInput
                            placeholder={translate('invite_member.placeholder')}
                            placeholderTextColor={color.text}
                            selectionColor={color.primary}
                            style={{color: color.textBlack}}
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
                                            paddingVertical: 3
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
                        <Member member={{ email: email }} add={true} />
                    </TouchableOpacity>
                }


            </View>
        </Modal >
    )
})
