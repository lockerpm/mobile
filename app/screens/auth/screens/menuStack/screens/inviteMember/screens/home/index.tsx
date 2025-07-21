import { useState, useEffect, FC, useCallback } from "react"
import { View, TouchableOpacity, StyleSheet, ViewStyle } from "react-native"
import { Screen, Text, Header, ListView } from "app/components/cores"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"
import { InviteToFamilyScreenProps } from "app/navigators"
import { useToast } from "app/services/utils"
import { useAppTheme } from "@/utils/useAppTheme"
import { useAppLocale } from "@/i18n"
import { Member } from "./Member"
import { FamilyMember } from "@/static/types"
import { ThemedStyle } from "@/theme"
import { AppEventType, EventBus } from "@/utils/eventBus"

export const ManageMemberScreen: FC<InviteToFamilyScreenProps<"manageMember">> = observer(
  ({ navigation }) => {
    const { user } = useStores()
    const {
      themed,
      theme: { colors },
    } = useAppTheme()
    const { notifyApiError } = useToast()
    const { translate } = useAppLocale()

    // ----------------------- PARAMS -----------------------
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])

    const isFamilyAccount =
      user.isFamilyPlan || user.isLifeTimeFamilyPlan || user.isLifeTimeTeamFamilyPlan

    const LIMIT = user.plan?.max_number || 6

    // ----------------------- METHODS -----------------------

    const getFamilyMember = useCallback(async () => {
      const res = await user.getFamilyMember()
      if (res.kind === "ok") {
        setFamilyMembers(res.data)
      } else {
        notifyApiError(res)
      }
    }, [])

    const navigateDeleteMemeber = useCallback(
      (member: FamilyMember) => {
        navigation.navigate("deleteMember", {
          id: member.id,
          email: member.email,
          avatar: member.avatar,
        })
      },
      [navigation]
    )

    const navigateInviteMemeber = useCallback(() => {
      navigation.navigate("inviteMember", {
        limit: LIMIT,
        familyMembers: familyMembers,
      })
    }, [LIMIT, familyMembers, navigation])

    // ----------------------- EFFECT -----------------------
    useEffect(() => {
      getFamilyMember()
    }, [])

    useEffect(() => {
      const listener1 = EventBus.createListener(AppEventType.INVITE_TO_FAMILY_MEMBER_UPDATE, () => {
        getFamilyMember()
      })

      return () => {
        EventBus.removeListener(listener1)
      }
    }, [])

    // ----------------------- RENDER -----------------------
    return (
      <Screen
        safeAreaEdges={["bottom"]}
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            titleTx={"invite_member:header"}
          />
        }
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <Text preset="bold" style={styles.text}>
            {translate("invite_member:number_member")} ({familyMembers?.length} / {LIMIT})
          </Text>
          {isFamilyAccount && (
            <TouchableOpacity
              disabled={familyMembers?.length >= LIMIT}
              onPress={navigateInviteMemeber}
            >
              <Text
                color={familyMembers?.length < LIMIT ? colors.primary : colors.background}
                tx="invite_member:action"
              />
            </TouchableOpacity>
          )}
        </View>
        <ListView
          data={familyMembers}
          keyExtractor={(item) => item.email}
          renderItem={({ item }) => <Member member={item} onActions={navigateDeleteMemeber} />}
          contentContainerStyle={styles.content}
          ItemSeparatorComponent={() => <View style={themed($divider)} />}
          estimatedItemSize={52}
        />
      </Screen>
    )
  }
)

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.border,
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
  text: { marginBottom: 8 },
})
