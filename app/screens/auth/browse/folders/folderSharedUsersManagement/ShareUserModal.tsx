// @ts-nocheck
import React, { useEffect, useState } from "react"
import { View, TouchableOpacity, Image, Modal } from "react-native"
import { GroupMemberData, GroupData, AccountRoleText } from "app/static/types"
import { FolderView } from "core/models/view/folderView"
import { CollectionView } from "core/models/view/collectionView"
import { useStores } from "app/models"
import { useFolder, useHelper } from "app/services/hook"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { Button, Header, Icon, Text, TextInput } from "app/components/cores"
import { useTheme } from "app/services/context"

interface InviteProps {
  isOpen: boolean
  folder?: FolderView | CollectionView
  onClose: () => void
  sharedUsers?: any[]
  isLoading?: boolean
}

export const AddUserShareFolderModal = (props: InviteProps) => {
  const { isOpen, onClose, sharedUsers, folder } = props
  const { user, enterpriseStore } = useStores()
  const { colors } = useTheme()
  const { notify, notifyApiError, translate } = useHelper()
  const { shareFolder, shareFolderAddMember } = useFolder()

  // ----------------------- PARAMS -----------------------

  const [email, setEmail] = useState<string>("")
  const [emails, setEmails] = useState<string[]>([])

  const [groups, setGroups] = useState<{ name: string; id: string }[]>([])
  type Suggest = GroupData | GroupMemberData
  const [suggestions, setSuggestions] = useState<Suggest[]>([])

  // ----------------------- METHODS -----------------------

  const addEmailToShare = (email: string) => {
    const e = email.trim().toLowerCase()
    if (!e) return

    const isOwner = user?.email === e
    const isIncluded = sharedUsers?.some((element) => element.email === e)
    if (!emails.includes(e) && !isOwner && !isIncluded) {
      setEmails([...emails, e])
      setEmail("")
    }
  }

  const removeEmailFromList = (val: string) => {
    setEmails(emails.filter((e) => e !== val))
  }

  const addFolderMember = async (emails?: string[]) => {
    let res
    if (folder instanceof CollectionView) {
      res = await shareFolderAddMember(folder, emails, AccountRoleText.MEMBER, true, groups)
    } else {
      res = await shareFolder(folder, emails, AccountRoleText.MEMBER, true, groups)
    }

    onClose()
    if (res.kind === "ok" || res.kind === "unauthorized") {
      if (res.kind === "ok") {
        notify("success", translate("shares.share_folder.success.shared"))
        setEmails([])
      }
    }
  }

  const searchGroupOrMember = async (query: string) => {
    const res = await enterpriseStore.searchGroupOrMember(user.enterprise.id, query)
    if (res.kind === "ok") {
      setSuggestions([...res.data.groups, ...res.data.members].slice(0, 4))
    } else {
      notifyApiError(res)
    }
  }

  // ----------------------- EFFECTS -----------------------

  // Close on signal
  useEffect(() => {
    const listener = EventBus.createListener(AppEventType.CLOSE_ALL_MODALS, () => {
      onClose()
    })
    return () => {
      EventBus.removeListener(listener)
    }
  }, [])

  useEffect(() => {
    if (user.isEnterprise) {
      const timeout = setTimeout(() => {
        if (email) {
          searchGroupOrMember(email)
        } else {
          setSuggestions([])
        }
      }, 500)
      return () => {
        clearTimeout(timeout)
      }
    }
    return undefined
  }, [email])

  // ----------------------- RENDER -----------------------
  return (
    <Modal
      presentationStyle="pageSheet"
      visible={isOpen}
      animationType="slide"
      onRequestClose={() => {
        onClose()
        setEmail("")
        setEmails([])
        setGroups([])
        setSuggestions([])
      }}
    >
      <Header
        leftIcon="x-circle"
        onLeftPress={() => onClose()}
        containerStyle={{
          paddingTop: 0,
        }}
        RightActionComponent={
          <Button
            preset="teriatary"
            disabled={emails?.length < 1 && groups.length < 1}
            onPress={() => {
              addFolderMember(emails)
            }}
            text={translate("common.done")}
            textStyle={{
              color: emails?.length > 0 || groups.length > 0 ? colors.primary : colors.disable,
            }}
          />
        }
      />

      <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 }}>
        <View style={{ marginTop: 8 }}>
          <Text preset="bold" size="xl" text={translate("shares.share_folder.select_member")} />
        </View>

        <View
          style={{
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          }}
        >
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              marginVertical: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                addEmailToShare(email)
              }}
              style={{ marginRight: 16, marginVertical: 16 }}
            >
              <Icon icon="user-plus" size={24} color={colors.title} />
            </TouchableOpacity>
            <TextInput
              placeholder={translate("shares.share_folder.add_email")}
              onChangeText={setEmail}
              value={email}
              clearButtonMode="unless-editing"
              clearTextOnFocus={true}
              onSubmitEditing={() => {
                addEmailToShare(email)
              }}
              containerStyle={{
                flex: 1,
              }}
            />
          </View>
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
                    paddingVertical: 4,
                  }}
                >
                  <Text text={e} />

                  <Icon
                    icon="x-circle"
                    size={20}
                    color={colors.title}
                    containerStyle={{
                      paddingHorizontal: 12,
                    }}
                    onPress={() => removeEmailFromList(e)}
                  />
                </View>
              )
            })}
          </View>

          <View>
            {groups.map((e, index) => {
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
                    paddingVertical: 4,
                  }}
                >
                  <Text text={e.name} />
                  <Icon
                    icon="x-circle"
                    size={20}
                    color={colors.title}
                    containerStyle={{
                      paddingHorizontal: 12,
                    }}
                    onPress={() => setGroups(groups.filter((group) => group.id !== e.id))}
                  />
                </View>
              )
            })}
          </View>
        </View>

        <View style={{ marginTop: 20, marginBottom: 20 }}>
          <Text>{translate("invite_member.select_person")}</Text>
        </View>
        {!!email && (
          <TouchableOpacity onPress={() => addEmailToShare(email)}>
            <View
              style={{
                borderBottomColor: colors.border,
                borderBottomWidth: 1,
                width: "100%",
                flexDirection: "row",
                marginBottom: 15,
                paddingVertical: 14,
                justifyContent: "flex-start",
              }}
            >
              <Image
                resizeMode="contain"
                source={require("./avatar.png")}
                style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
              />

              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text text={email}></Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Enterprise suggestion */}
        {suggestions.length > 0 && (
          <View style={{ marginTop: 20, marginBottom: 20 }}>
            <Text style={{ marginBottom: 8 }}>{"User or group in Enterprise".toUpperCase()}</Text>
            {suggestions.map((e, index) => (
              <TouchableOpacity
                key={e + index.toString()}
                onPress={() => {
                  if (e.email) {
                    addEmailToShare(e.email)
                  } else {
                    if (groups.some((g) => g.id === e.id)) {
                      return
                    }
                    setGroups([
                      ...groups,
                      {
                        name: e.name,
                        id: e.id,
                      },
                    ])
                  }
                }}
              >
                <View
                  style={{
                    borderBottomColor: colors.border,
                    borderBottomWidth: 1,
                    width: "100%",
                    flexDirection: "row",
                    paddingVertical: 8,
                    justifyContent: "flex-start",
                  }}
                >
                  <Image
                    resizeMode="contain"
                    source={e.email ? { uri: e.avatar } : require("./group.png")}
                    style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
                  />

                  <View style={{ flex: 1, justifyContent: "center" }}>
                    <Text text={e.email || e.name}></Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </Modal>
  )
}
