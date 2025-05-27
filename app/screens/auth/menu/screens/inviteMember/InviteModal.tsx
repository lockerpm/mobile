import React, { useCallback, useEffect, useState } from "react"
import { View, TouchableOpacity, Modal, StyleSheet } from "react-native"
import { Member } from "./Member"
import { Icon, Text, Button, TextInput } from "app/components/cores"
import { useStores } from "app/models"
import { useHelper } from "app/services/hook"
import { useAppLocale, useTheme } from "app/services/context"
import { AppEventType, EventBus } from "app/utils/eventBus"

interface InviteProps {
  limit: number
  isShow: boolean
  onClose: React.Dispatch<React.SetStateAction<boolean>>
  familyMembers?: any
  setRelad?: any
}
export const InviteMemberModal = (props: InviteProps) => {
  const { limit, isShow, onClose, familyMembers, setRelad } = props
  const { user } = useStores()
  const { colors } = useTheme()
  const { notifyApiError, notify } = useHelper()
  const { translate } = useAppLocale()

  // ----------------------- PARAMS -----------------------
  const [email, setEmail] = useState<string>("")
  const [emails, setEmails] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const isIncluded = familyMembers.some((element) => element.email === email?.trim().toLowerCase())
  const isAdded = emails.includes(email?.trim().toLowerCase())

  // ----------------------- METHODS -----------------------
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
    [familyMembers, emails, limit, user?.email],
  )

  const removeEmailFromInviteList = useCallback((val: string) => {
    setEmails((prev) => prev.filter((e) => e !== val))
  }, [])

  const addFamilyMember = useCallback(async (emails?: string[]) => {
    setIsLoading(true)
    const res = await user.addFamilyMember(emails)
    onClose(false)
    if (res.kind === "ok") {
      notify("success", translate("invite_member.add_noti"))
      setEmails([])
      setRelad(true)
    } else {
      notifyApiError(res)
    }
    setIsLoading(false)
  }, [])

  const onReset = useCallback(() => {
    setEmail("")
    setEmails([])
  }, [])

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
      onRequestClose={() => onClose(false)}
      onDismiss={onReset}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Icon icon="x" onPress={() => onClose(false)} />
          <Button
            loading={isLoading}
            preset="teriatary"
            disabled={isLoading || emails.length === 0}
            onPress={() => {
              addFamilyMember(emails)
            }}
            text={translate("invite_member.action")}
          />
        </View>
        <Text
          preset="bold"
          size="xl"
          style={{ marginTop: 12 }}
          text={translate("invite_member.title")}
        />

        <View
          style={{
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          }}
        >
          <View style={styles.emailInput}>
            <TouchableOpacity
              onPress={() => {
                addEmailToInviteList(email)
              }}
              style={styles.userPlus}
            >
              <Icon icon={"user-plus"} size={24} color={colors.title} />
            </TouchableOpacity>
            <View
              style={{
                flex: 1,
              }}
            >
              <TextInput
                placeholder={translate("invite_member.placeholder")}
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
              />
            </View>
          </View>
          {(isIncluded || isAdded) && (
            <Text
              preset="label"
              text={translate("invite_member.existing_member")}
              style={{ marginTop: 8, textAlign: "center" }}
            />
          )}
          <View>
            {emails.map((e, index) => {
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
                    paddingVertical: 3,
                  }}
                >
                  <Text text={e} />

                  <TouchableOpacity
                    onPress={() => removeEmailFromInviteList(e)}
                    style={{
                      paddingHorizontal: 12,
                      alignItems: "center",
                    }}
                  >
                    <Icon icon="x-circle" size={20} color={colors.title} />
                  </TouchableOpacity>
                </View>
              )
            })}
          </View>
        </View>

        <View style={{ marginTop: 20, marginBottom: 20 }}>
          <Text>{translate("invite_member.select_person")}</Text>
        </View>
        {email.length > 0 && (
          <TouchableOpacity onPress={() => addEmailToInviteList(email)}>
            <Member member={{ email }} add={true} />
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emailInput: {
    flexDirection: "row",
    flexShrink: 1,
    width: "100%",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  userPlus: {
    marginRight: 16,
    marginVertical: 16,
  },
})
