import { FC, useCallback, useState } from "react"
import { View, StyleSheet, ViewStyle } from "react-native"
import { InviteMember } from "./Member"
import { Text, Button, TextInput, PressableIcon, Screen, Header } from "app/components/cores"
import { useStores } from "app/models"
import { useToast } from "app/services/utils"
import { useAppTheme } from "@/utils/useAppTheme"
import { useAppLocale } from "@/i18n"
import { ThemedStyle } from "@/theme"
import { InviteToFamilyScreenProps } from "@/navigators"
import { debounce } from "@/utils/utils"
import { AppEventType, EventBus } from "@/utils/eventBus"

export const InviteMemberScreen: FC<InviteToFamilyScreenProps<"inviteMember">> = ({
  navigation,
  route: {
    params: { limit, familyMembers },
  },
}) => {
  const { user } = useStores()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { notifyTx, notifyApiError } = useToast()
  const { translate } = useAppLocale()

  // ----------------------- PARAMS -----------------------
  const [email, setEmail] = useState<string>("")
  const [emails, setEmails] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const isIncluded = familyMembers.some((element) => element.email === email?.trim().toLowerCase())
  const isAdded = emails.includes(email?.trim().toLowerCase())

  // ----------------------- METHODS -----------------------
  const onClose = debounce(navigation.goBack, 400)
  const addEmailToInviteList = useCallback(
    (email: string) => {
      const e = email.trim().toLowerCase()
      if (!e) return

      const unreachLimit = familyMembers.length + emails.length < limit
      if (!unreachLimit) return

      const isOwner = user?.email === e
      const isIncluded = familyMembers.some((element) => element.email === e)

      if (!emails.includes(e) && !isOwner && !isIncluded) {
        setEmails([...emails, e])
        setEmail("")
      }
    },
    [familyMembers, emails, limit, user?.email]
  )

  const removeEmailFromInviteList = useCallback((val: string) => {
    setEmails((prev) => prev.filter((e) => e !== val))
  }, [])

  const addFamilyMember = useCallback(async (emails: string[]) => {
    setIsLoading(true)
    const res = await user.addFamilyMember(emails)
    if (res.kind === "ok") {
      notifyTx("success", "invite_member:add_noti")
      EventBus.emit(AppEventType.INVITE_TO_FAMILY_MEMBER_UPDATE, null)
    } else {
      notifyApiError(res)
    }
    onClose()
  }, [])

  // ----------------------- RENDER -----------------------
  return (
    <Screen
      safeAreaEdges={["bottom"]}
      header={
        <Header leftIcon="arrow-left" onLeftPress={onClose} titleTx={"invite_member:header"} />
      }
      keyboardOffset={16}
      footer={
        <Button
          loading={isLoading}
          disabled={isLoading || emails.length === 0}
          onPress={() => {
            addFamilyMember(emails)
          }}
          style={styles.mr16}
          text={translate("invite_member:action")}
        />
      }
      contentContainerStyle={styles.container}
    >
      <Text preset="bold" size="lg" tx={"invite_member:title"} />

      <View style={styles.emailInput}>
        <PressableIcon
          icon={"user-plus"}
          size={24}
          color={colors.title}
          containerStyle={styles.userPlus}
          onPress={() => {
            addEmailToInviteList(email)
          }}
        />
        <View style={styles.flex}>
          <TextInput
            placeholderTx={"invite_member:placeholder"}
            placeholderTextColor={colors.label}
            selectionColor={colors.primary}
            style={{ color: colors.title }}
            onChangeText={setEmail}
            value={email}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="done"
            clearButtonMode="unless-editing"
            clearTextOnFocus={true}
            onSubmitEditing={() => {
              addEmailToInviteList(email)
            }}
          />
        </View>
      </View>
      {(isIncluded || isAdded) && (
        <Text preset="label" tx={"invite_member:existing_member"} style={styles.existing_member} />
      )}
      <View>
        {emails.map((e, index) => {
          return (
            <View key={index} style={themed($email)}>
              <Text text={e} style={styles.email} />

              <PressableIcon
                icon="x-circle"
                size={20}
                color={colors.label}
                onPress={() => removeEmailFromInviteList(e)}
              />
            </View>
          )
        })}
      </View>

      <Text tx="invite_member:select_person" style={styles.select_person} />
      {email.length > 0 && <InviteMember email={email} onPress={addEmailToInviteList} />}
    </Screen>
  )
}

const $email: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 8,
  borderWidth: 0.5,
  borderColor: colors.border,
  backgroundColor: colors.block,
  paddingHorizontal: 16,
  paddingVertical: 8,
  marginVertical: 12,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  email: {
    flexGrow: 1,
    flexShrink: 1,
  },
  emailInput: {
    flexDirection: "row",
    flexShrink: 1,
    marginTop: 12,
    width: "100%",
  },
  existing_member: {
    textAlign: "center",
  },
  flex: {
    flex: 1,
  },
  mr16: {
    marginHorizontal: 16,
  },
  select_person: { marginVertical: 16 },
  userPlus: {
    marginRight: 16,
    marginVertical: 16,
  },
})
