import React, { useState } from "react"
import { View, Image, TouchableOpacity } from "react-native"
import { BottomModal, Icon, Text } from "app/components/cores"
import { useTheme } from "app/services/context"
import { useHelper } from "app/services/hook"

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
  family?: boolean
  add?: boolean
  onRemove?: (id: string) => Promise<void>
}

export const Member = (props: MemberProps) => {
  const { member, family, add, onRemove } = props
  const { id, email, avatar, full_name } = member
  const { colors } = useTheme()
  const { translate } = useHelper()

  const owner = id === null
  // ----------------------- PARAMS -----------------------

  const [showSheetModal, setShowSheetModal] = useState<boolean>(false)

  // ----------------------- RENDER -----------------------
  return (
    <View
      style={{
        borderBottomColor: colors.block,
        borderBottomWidth: 1,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
        paddingVertical: 14,
        justifyContent: "flex-start",
      }}
    >
      <Image
        resizeMode="contain"
        source={avatar ? { uri: avatar } : require("./avatar.png")}
        style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
      />

      {add && (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text text={email}></Text>
        </View>
      )}
      {!add && (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text
            text={full_name || "Unknown"}
            style={{ color: owner ? colors.primary : colors.title }}
          />
          <Text text={email} style={{ color: colors.secondaryText, fontSize: 15 }} />
        </View>
      )}

      {!add && family && !owner && (
        <TouchableOpacity
          onPress={() => setShowSheetModal(true)}
          style={{ justifyContent: "center" }}
        >
          <Icon icon="dots-three" size={20} />
        </TouchableOpacity>
      )}

      <BottomModal title="" isOpen={showSheetModal} onClose={() => setShowSheetModal(false)}>
        <View
          style={{
            alignItems: "center",
            borderBottomColor: colors.block,
            borderBottomWidth: 1,
            flexDirection: "row",
            justifyContent: "center",
            paddingBottom: 12,
          }}
        >
          <Image
            resizeMode="contain"
            source={avatar ? { uri: avatar } : require("./avatar.png")}
            style={{ height: 40, width: 40, borderRadius: 20, marginRight: 12 }}
          />
          <Text ellipsizeMode="tail" style={{ maxWidth: "70%" }}>
            {email}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setShowSheetModal(false)
            onRemove(id.toString())
          }}
          style={{
            alignSelf: "center",
            marginTop: 20,
            borderColor: colors.error,
            borderRadius: 12,
            borderWidth: 1,
            width: "100%",
            padding: 16,
            alignItems: "center",
          }}
        >
          <Text color={colors.error} text={translate("invite_member.remove")} />
        </TouchableOpacity>
      </BottomModal>
    </View>
  )
}
