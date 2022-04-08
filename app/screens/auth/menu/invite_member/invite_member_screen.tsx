import React, { useState, useEffect } from "react"
import { View, TouchableOpacity, TextInput, Image, Alert } from "react-native"
import { Button, Text } from "../../../../components"
import { useStores } from "../../../../models"
import { observer } from "mobx-react-lite"
import { commonStyles } from "../../../../theme"
import { Modal } from "react-native-ui-lib"
import { ScrollView } from "react-native-gesture-handler"
import { useMixins } from "../../../../services/mixins"
import { FamilyMemberProp, Member } from "./member"
import Entypo from 'react-native-vector-icons/Entypo'


interface InviteProps {
    isShow: boolean
    onClose: React.Dispatch<React.SetStateAction<boolean>>
}
export const InviteMemberScreen = observer(function InviteMemberScreen(props: InviteProps) {
    const { translate, color, notify } = useMixins()
    const { isShow, onClose } = props
    const { user } = useStores()

    // ----------------------- PARAMS -----------------------
    const [reload, setRelad] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [emails, setEmails] = useState<string[]>([]);
    const [isEnterEmail, onEnterEmail] = useState<boolean>(false);
    const [familyMembers, setFamilyMembers] = useState<FamilyMemberProp[]>([]);

    // ----------------------- METHODS -----------------------
    const addEmailToInviteList = (email: string) => {
        const e = email.trim().toLowerCase()
        const isOwnerEmails = user?.email == e
        const isIncluded = familyMembers.some(element => element.email === e)
        if (!!e && !emails.includes(e) && !isIncluded && !isOwnerEmails) {
            setEmails([...emails, e])
            setEmail("")
        }
    }
    const removeEmailFromInviteList = (val: string) => {
        setEmails(emails.filter(e => e !== val))
    }

    const getFamilyMember = async () => {
        const res = await user.getFamilyMember()
        if (res.kind === "ok") {
            setFamilyMembers(res.data)
            console.log(res.data)
        }
    }

    const addFamilyMember = async (emails?: string[]) => {
        const res = await user.addFamilyMember(emails)
        if (res.kind === "ok") {
            notify('success', "thêm thàn viên thành công")
            setEmails([])
            setRelad(true)
        } else {
            notify('error', "Thêm thành viên thất bại.")
        }

    }

    const confirmRemoveAction = async (id: string) => {
        Alert.alert(
            "Are you sure you want to remove this user from Family Plan?",
            "",
            [
                {
                    text: "Remove", 
                    onPress: () => {
                        console.log(id)
                        removeFamilyMember(id)
                    },
                    style: "destructive"
                },
                {
                    text: "Cancel", 
                    onPress: () => {
                        return
                    },
                    style: "cancel"
                    
                }
            ],
            {
              cancelable: true,
            }
        )
    }
    const removeFamilyMember = async (id: string) => {
        const res = await user.removeFamilyMember(id)
        notify('error', "Unknow Error")
        if (res.kind === "ok") {
            setRelad(true)
        } else {
            notify('error', "Unknow Error")
        }
    }

    // ----------------------- EFFECT -----------------------
    useEffect(() => {
        getFamilyMember()
    }, [])

    useEffect(() => {
        if (reload) {
            setRelad(false)
            setEmail("")
            onEnterEmail(false)
            getFamilyMember()
        }
    }, [reload])


    // ----------------------- RENDER -----------------------
    return (
        <Modal
            presentationStyle="pageSheet"
            visible={isShow}
            animationType="slide"
            onRequestClose={() => onClose(!isShow)}
        >
            <View style={[commonStyles.SECTION_PADDING, { flex: 1 }]}>
                <View style={{
                    height: 40,
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "space-between"
                }} >
                    <TouchableOpacity
                        onPress={() => onClose(!isShow)}>
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
                        <Text style={{
                            color: (emails.length > 0) ? "#007AFF" : color.block
                        }}>{translate('invite_member.action')}</Text>
                    </Button>
                </View>
                {
                    !isEnterEmail && <View style={{ marginTop: 12 }}>
                        <Text preset="header">{translate('invite_member.title')}</Text>
                    </View>
                }
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
                            placeholder={translate('invite_member.placeholder')}
                            placeholderTextColor={color.text}
                            onChangeText={setEmail}
                            value={email}
                            clearButtonMode="unless-editing"
                            clearTextOnFocus={true}
                            onTouchStart={() => [
                                onEnterEmail(true)
                            ]}
                            onFocus={() => {
                                onEnterEmail(true)
                            }}
                            onSubmitEditing={() => {
                                addEmailToInviteList(email)
                                onEnterEmail(false)
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
                    {!isEnterEmail ? <Text>{translate('invite_member.list_member_title')}</Text> : <Text>{translate('invite_member.select_person')}</Text>}
                </View>

                {
                    !isEnterEmail && <View style={{ flex: 1 }}>
                        <Text preset="bold" style={{ marginVertical: 20 }}>{translate('invite_member.number_member')} ({1 + familyMembers?.length} / 6)</Text>

                        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                            <Member member={{ email: user.email, avatar: user.avatar }} familyOwner={true} />
                            {
                                familyMembers.map((e, index) => {
                                    return <Member key={index} member={e} onRemove={confirmRemoveAction} />
                                })
                            }
                        </ScrollView>
                    </View>

                }
                {
                    isEnterEmail && email.length > 0 &&
                    <TouchableOpacity onPress={() => addEmailToInviteList(email)}>
                        <Member member={{ email: email }} add={true} />
                    </TouchableOpacity>
                }
            </View>
        </Modal >
    )
})
