import React, { useEffect, useState } from "react"
import { View, TouchableOpacity, TextInput, Modal } from "react-native"
import { Member } from "./Member"

import { Icon, Text } from 'app/components-v2/cores'
import { useStores } from "app/models"
import { useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"
import { FAMILY_MEMBER_LIMIT } from "app/static/constants"
import { translate } from "app/i18n"
import { AppEventType, EventBus } from "app/utils/eventBus"

interface InviteProps {
    isShow: boolean
    onClose: React.Dispatch<React.SetStateAction<boolean>>
    familyMembers?: any
    setRelad?: any
}
export const InviteMemberModal = (props: InviteProps) => {
    const { isShow, onClose, familyMembers, setRelad } = props
    const { user } = useStores()
    const { colors } = useTheme()
    const { notifyApiError, notify } = useHelper()

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
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <View style={{
                    height: 40,
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "space-between"
                }} >
                    <TouchableOpacity
                        onPress={() => onClose(!isShow)}>
                        <Icon icon={"x-circle"} size={18} color={colors.title} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        disabled={emails.length < 1}
                        onPress={() => {
                            addFamilyMember(emails);
                        }}>
                        <Text style={{
                            color: (emails.length > 0) ? colors.primary : colors.disable
                        }}>{translate('invite_member.action')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ marginTop: 12 }}>
                    <Text preset="bold" size="xl">{translate('invite_member.title')}</Text>
                </View>

                <View style={{
                    borderBottomColor: colors.border,
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
                            <Icon icon={"user-plus"} size={24} color={colors.title} />
                        </TouchableOpacity>
                        <TextInput
                            placeholder={translate('invite_member.placeholder')}
                            placeholderTextColor={colors.secondaryText}
                            selectionColor={colors.primary}
                            style={{ color: colors.title }}
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
                                            borderColor: colors.border,
                                            backgroundColor: colors.block,
                                            paddingLeft: 10,
                                            marginBottom: 16,
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            paddingVertical: 3
                                        }}
                                    >
                                        <Text
                                            text={e}
                                        />

                                        <TouchableOpacity
                                            onPress={() => removeEmailFromInviteList(e)}
                                            style={{
                                                paddingHorizontal: 12,
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Icon icon="x-circle" size={20} color={colors.title} />
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
}
