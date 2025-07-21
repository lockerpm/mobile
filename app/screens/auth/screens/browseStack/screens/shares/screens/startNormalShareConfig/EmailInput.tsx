import { PressableIcon, TextInput, Text } from "@/components/cores"
import { useStores } from "@/models"
import { useToast } from "@/services/utils"
import { GroupData, GroupMemberData } from "@/static/types"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { validateEmail } from "@/utils/utils"
import { observer } from "mobx-react-lite"
import { useEffect, useState } from "react"
import { StyleSheet, TouchableOpacity, View, ViewStyle, Image } from "react-native"

interface Props {
  emails: string[]
  setEmails: (emails: string[]) => void
  groups: { name: string; id: string }[]
  setGroups: (groups: { name: string; id: string }[]) => void
}

const SHARE_GROUP = require("assets/images/icons/group.png")

export const EmailInput = observer(({ setEmails, emails, setGroups, groups }: Props) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { user, enterpriseStore } = useStores()
  const { notifyTx, notifyApiError } = useToast()

  // ---------------------PARAMS--------------------
  const [email, setEmail] = useState("")
  const [suggestions, setSuggestions] = useState<{
    members: GroupMemberData[]
    groups: GroupData[]
  } | null>(null)

  // ---------------------METHODS--------------------
  const onAddEmail = (val: string) => {
    const e = val.trim().toLowerCase()
    if (!validateEmail(e)) {
      notifyTx("error", "error:email_validate")
      return
    }
    if (!!e && !emails.includes(e)) {
      setEmails([...emails, e])
    }
    setEmail("")
    setSuggestions(null)
  }
  const onAddGroup = (e: GroupData) => {
    if (groups.some((i) => i.id === e.id)) {
      return
    }
    setGroups([
      ...groups,
      {
        name: e.name,
        id: e.id,
      },
    ])
    setEmail("")
    setSuggestions(null)
  }

  const searchGroupOrMember = async (query: string) => {
    const res = await enterpriseStore.searchGroupOrMember(user.enterprise?.id ?? "", query)
    if (res.kind === "ok") {
      setSuggestions({
        members: res.data.members,
        groups: res.data.groups,
      })
    } else {
      notifyApiError(res)
    }
  }

  // ----------------------- EFFECTS -----------------------

  useEffect(() => {
    if (user.isEnterprise && email.length > 0) {
      const timeout = setTimeout(() => {
        searchGroupOrMember(email)
      }, 500)
      return () => clearTimeout(timeout)
    }
    return undefined
  }, [email])

  return (
    <View style={themed($container)}>
      {/* Enterprise suggestion */}
      {!!suggestions && (suggestions.members.length > 0 || suggestions.groups.length > 0) && (
        <View>
          <Text tx="shares:suggestion" style={styles.mb20} />
          {suggestions.members.map((e, index) => (
            <TouchableOpacity
              key={e.email + index.toString()}
              onPress={() => {
                onAddEmail(e.email)
              }}
            >
              <View style={themed($suggest)}>
                <Image resizeMode="contain" source={{ uri: e.avatar }} style={styles.shareAvatar} />
                <Text text={e.email} style={styles.email} />
              </View>
            </TouchableOpacity>
          ))}
          {suggestions.groups.map((e, index) => (
            <TouchableOpacity
              key={e.name + index.toString()}
              onPress={() => {
                onAddGroup(e)
              }}
            >
              <View style={themed($suggest)}>
                <Image resizeMode="contain" source={SHARE_GROUP} style={styles.shareAvatar} />
                <Text text={e.name} style={styles.email} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={styles.inpuContainer}>
        <View style={styles.input}>
          <TextInput
            onChangeText={setEmail}
            value={email}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="next"
            placeholderTx="shares:share_folder.add_email"
            clearButtonMode="unless-editing"
            clearTextOnFocus={true}
            onSubmitEditing={() => onAddEmail(email)}
          />
        </View>
        <PressableIcon
          icon="user-plus"
          size={24}
          color={colors.white}
          onPress={() => onAddEmail(email)}
          containerStyle={[themed($inputAdd), !email && styles.disableAdd]}
        />
      </View>
    </View>
  )
})

const $suggest: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderBottomColor: colors.block,
  borderBottomWidth: 1,
  width: "100%",
  flexDirection: "row",
  paddingVertical: 8,
  justifyContent: "flex-start",
})

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderTopColor: colors.disable,
  borderTopWidth: 1,
  backgroundColor: colors.background,
})

const $inputAdd: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.primary,
  borderRadius: 12,
  padding: 12,
})

const styles = StyleSheet.create({
  disableAdd: {
    opacity: 0.5,
  },
  email: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  inpuContainer: {
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
  },
  input: {
    flex: 1,
    marginRight: 12,
  },
  mb20: {
    marginBottom: 8,
  },

  shareAvatar: { borderRadius: 16, height: 32, marginRight: 12, width: 32 },
})
