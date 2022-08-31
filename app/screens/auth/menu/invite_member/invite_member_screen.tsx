import React, { useState, useEffect } from "react"
import { View, Alert } from "react-native"
import { Button, Layout, Text, Header } from "../../../../components"
import { useStores } from "../../../../models"
import { observer } from "mobx-react-lite"
import { commonStyles } from "../../../../theme"
import { useMixins } from "../../../../services/mixins"
import { useNavigation } from "@react-navigation/native"
import { PlanType } from "../../../../config/types"
import { FamilyMemberProp, Member } from "./member"
import { InviteMemberModal } from "./invite-modal"
import { FAMILY_MEMBER_LIMIT } from "../../../../config/constants"

export const InviteMemberScreen = observer(function InviteMemberScreen() {
    const navigation = useNavigation()
    const { user } = useStores()
    const { translate, color, notifyApiError, notify } = useMixins()

    // ----------------------- PARAMS -----------------------
    const [reload, setRelad] = useState<boolean>(true);
    const [familyMembers, setFamilyMembers] = useState<FamilyMemberProp[]>([]);
    const [showInviteMemberModal, setShowInviteMemberModal] = useState(false)

    const isFamilyAccount = user.plan?.alias === PlanType.FAMILY

    // ----------------------- METHODS -----------------------
    const getFamilyMember = async () => {
        const res = await user.getFamilyMember()
        if (res.kind === "ok") {
            setFamilyMembers(res.data)
        } else {
            notifyApiError(res)
        }
    }

    const comfirmRemoveMember = async (id: string) => {
        Alert.alert(
            translate("invite_member.confirm"), "",
            [
                {
                    text: translate("common.yes"),
                    onPress: () => {
                        removeFamilyMember(id)
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
    const removeFamilyMember = async (id: string) => {
        const res = await user.removeFamilyMember(id)
        if (res.kind === "ok") {
            setRelad(true)
            notify("success", translate("invite_member.delete_noti"))
        } else {
            notifyApiError(res)
        }
    }
    // ----------------------- EFFECT -----------------------
    useEffect(() => {
        if (reload) {
            setRelad(false)
            getFamilyMember()
        }
    }, [reload])

    // ----------------------- RENDER -----------------------
    return (
        <Layout
            header={(
                <Header
                    goBack={() => {
                        navigation.goBack()
                    }}
                    title={translate('invite_member.header')}
                    right={(<View style={{ width: 30 }} />)}
                />
            )}
            containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
        >
            <View style={[commonStyles.SECTION_PADDING, { flex: 1, backgroundColor: color.background }]}>
                <View>
                    <InviteMemberModal
                        isShow={showInviteMemberModal}
                        onClose={setShowInviteMemberModal}
                        familyMembers={familyMembers}
                        setRelad={setRelad} />

                    <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                        <Text
                            preset="bold"
                            style={{ marginBottom: 20, fontSize: 16 }}
                        >
                            {translate('invite_member.number_member')} ({familyMembers?.length} / 6)
                        </Text>
                        {isFamilyAccount && <Button
                            preset="link"
                            disabled={familyMembers?.length >= FAMILY_MEMBER_LIMIT}
                            onPress={() => {
                                setShowInviteMemberModal(true);
                            }}>
                            <Text style={{ color: familyMembers?.length < FAMILY_MEMBER_LIMIT ? color.primary : color.background }}>
                                {translate('invite_member.action')}
                            </Text>
                        </Button>}
                    </View>

                    <View>
                        {
                            familyMembers.map((e, index) => {
                                return <Member key={index} family={isFamilyAccount} member={e} onRemove={comfirmRemoveMember} />
                            })
                        }
                    </View>
                </View>
            </View>
        </Layout >
    )
})
