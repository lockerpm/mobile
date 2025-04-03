import React, { useState, useEffect } from "react"
import { View, Alert, TouchableOpacity, FlatList, StyleSheet } from "react-native"
import { Screen, Text, Header } from "app/components/cores"
import { useNavigation } from "@react-navigation/native"

import { FamilyMemberProp, Member } from "./Member"
import { InviteMemberModal } from "./InviteModal"
import { useStores } from "app/models"
import { useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"
import { FAMILY_MEMBER_LIMIT, FAMILY_MEMBER_LIMIT_TEAM } from "app/static/constants"
import { observer } from "mobx-react-lite"

export const InviteMemberScreen = observer(() => {
  const navigation = useNavigation()
  const { user } = useStores()
  const { colors } = useTheme()
  const { notifyApiError, notify, translate } = useHelper()

  // ----------------------- PARAMS -----------------------
  const [reload, setRelad] = useState<boolean>(true)
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberProp[]>([])
  const [showInviteMemberModal, setShowInviteMemberModal] = useState(false)

  const isFamilyAccount =
    user.isFamilyPlan || user.isLifeTimeFamilyPlan || user.isLifeTimeTeamFamilyPlan

  const LIMIT = user.isLifeTimeTeamFamilyPlan ? FAMILY_MEMBER_LIMIT_TEAM : FAMILY_MEMBER_LIMIT

  console.log(familyMembers.map((e) => e.email))
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
      translate("invite_member.confirm"),
      "",
      [
        {
          text: translate("common.yes"),
          onPress: () => {
            removeFamilyMember(id)
          },
          style: "destructive",
        },
        {
          text: translate("common.cancel"),
          style: "cancel",
        },
      ],
      {
        cancelable: true,
      },
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
    <Screen
      safeAreaEdges={["bottom"]}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
          title={translate("invite_member.header")}
        />
      }
      contentContainerStyle={styles.container}
    >
      <InviteMemberModal
        limit={LIMIT}
        isShow={showInviteMemberModal}
        onClose={setShowInviteMemberModal}
        familyMembers={familyMembers}
        setRelad={setRelad}
      />

      <View style={styles.header}>
        <Text preset="bold" style={styles.text}>
          {translate("invite_member.number_member")} ({familyMembers?.length} / {LIMIT})
        </Text>
        {isFamilyAccount && (
          <TouchableOpacity
            disabled={familyMembers?.length >= LIMIT}
            onPress={() => {
              setShowInviteMemberModal(true)
            }}
          >
            <Text
              style={{
                color: familyMembers?.length < LIMIT ? colors.primary : colors.background,
              }}
            >
              {translate("invite_member.action")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={familyMembers}
        keyExtractor={(item) => item.email}
        renderItem={({ item }) => <Member family member={item} onRemove={comfirmRemoveMember} />}
        contentContainerStyle={styles.content}
      />
    </Screen>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  text: { fontSize: 16, marginBottom: 20 },
})
