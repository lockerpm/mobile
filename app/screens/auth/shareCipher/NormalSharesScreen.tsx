// @ts-nocheck
import React, { FC, useEffect, useState } from "react"
import { View, TouchableOpacity, Image, FlatList } from "react-native"
import { Button, Header, Icon, Screen, Text, TextInput } from "app/components/cores"
import { SharedUsers } from "./SharedUser"
import {
  GroupMemberData,
  GroupData,
  SharedMemberType,
  SharedGroupType,
  AccountRoleText,
} from "app/static/types"
import { useStores } from "app/models"
import { useTheme } from "app/services/context"
import { useCipherData, useHelper } from "app/services/hook"
import { CipherView } from "core/models/view"
import { observer } from "mobx-react-lite"
import { AppStackScreenProps } from "app/navigators/navigators.types"

const SHARE_AVATAR = require("assets/images/icons/avatar-2.png")
const SHARE_GROUP = require("assets/images/icons/group.png")

export const NormalSharesScreen: FC<AppStackScreenProps<"normal_shares">> = observer((props) => {
  const route = props.route
  const navigation = props.navigation
  const { ciphers } = route.params
  const { cipherStore, enterpriseStore, user } = useStores()
  const { colors } = useTheme()
  const { notifyApiError, translate } = useHelper()
  const { shareCipher, shareMultipleCiphers, stopShareCipherForGroup, stopShareCipher } =
    useCipherData()

  const cipherIds = ciphers?.length > 1 ? ciphers.map((c) => c.id) : null
  const selectedCipher: CipherView = ciphers?.length === 1 ? ciphers[0] : null

  // --------------- PARAMS ----------------
  const [page, setPage] = useState<0 | 1>(0)
  const [email, setEmail] = useState("")
  const [emails, setEmails] = useState<string[]>([])
  const [shareType, setShareType] = useState("view")
  const [groups, setGroups] = useState<{ name: string; id: string }[]>([])
  type Suggest = GroupData | GroupMemberData
  const [suggestions, setSuggestions] = useState<Suggest[]>([])

  const [reload, setReload] = useState<boolean>(true)
  const [sharedUsers, setSharedUsers] = useState<SharedMemberType[]>([])

  const [sharedGroups, setSharedGroups] = useState<SharedGroupType[]>([])

  const sharedData = (() => {
    const data = []
    sharedGroups.forEach((e) => {
      data.push({
        type: "group",
        ...e,
      })
    })
    sharedUsers.forEach((e) => {
      data.push({
        type: "user",
        ...e,
      })
    })
    return data
  })()
  // --------------- COMPUTED ----------------

  const showManageShare = !!selectedCipher?.organizationId

  // --------------- METHODS ----------------

  const addEmail = (val: string) => {
    const e = val.trim().toLowerCase()
    if (!!e && !emails.includes(e)) {
      setEmails([...emails, e])
    }
    setEmail("")
  }

  const removeEmail = (val: string) => {
    setEmails(emails.filter((e) => e !== val))
  }

  const getSharedUsers = async () => {
    const res = await cipherStore.loadMyShares()
    if (res.kind !== "ok") {
      notifyApiError(res)
    }
    const share = cipherStore.myShares.find((s) => s.id === selectedCipher.organizationId)
    if (share) {
      if (share.members.length > 0) setSharedUsers(share.members)

      if (share.groups.length > 0) setSharedGroups(share.groups)

      return share.members?.length + share.groups?.length
    }
    return 0
  }

  const onRemove = async (id: string, isGroup?: boolean) => {
    let res
    if (isGroup) {
      res = await stopShareCipherForGroup(selectedCipher, id)
    } else {
      res = await stopShareCipher(selectedCipher, id)
    }
    if (res.kind === "ok" || res.kind === "unauthorized") {
      const sharedUserCount = await getSharedUsers()
      if (sharedUserCount === 0) {
        setPage(0)
      }
    }
  }

  // Share single/multiple
  const handleShare = async () => {
    let role = AccountRoleText.MEMBER
    let autofillOnly = false
    switch (shareType) {
      case "only_fill":
        autofillOnly = true
        break
      case "edit":
        role = AccountRoleText.ADMIN
        break
    }

    const res = cipherIds
      ? await shareMultipleCiphers(cipherIds, emails, role, autofillOnly, groups)
      : await shareCipher(selectedCipher, emails, role, autofillOnly, groups)

    if (res.kind === "ok" || res.kind === "unauthorized") {
      reset()
      navigation.goBack()
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

  const reset = () => {
    setEmail("")
    setEmails([])
    setGroups([])
    setSuggestions([])
    setShareType("view")
    setReload(true)
    setSharedUsers([])
    setSharedGroups([])
  }
  // ----------------------- EFFECTS -----------------------

  useEffect(() => {
    if (user.isEnterprise) {
      const timeout = setTimeout(() => {
        if (email) {
          searchGroupOrMember(email)
        } else {
          setSuggestions([])
        }
      }, 500)
      return () => clearTimeout(timeout)
    }
    return undefined
  }, [email])

  useEffect(() => {
    page === 1 && getSharedUsers()
  }, [page, reload])

  // --------------- RENDER ----------------

  const renderAddUser = () => (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          // alignItems: "flex-start",
          alignItems: "center",
        }}
      >
        <Text style={{ maxWidth: "50%" }} preset="bold" size="xl" text={selectedCipher.name} />
        {showManageShare && (
          <TouchableOpacity onPress={() => setPage(1)}>
            <Text
              preset="bold"
              text={translate("shares.share_folder.manage_user")}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
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
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              addEmail(email)
            }}
          >
            <Icon
              icon="user-plus"
              size={24}
              onPress={() => {
                addEmail(email)
              }}
              containerStyle={{ paddingRight: 16, paddingVertical: 16, marginTop: 22 }}
            />
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
            }}
          >
            <TextInput
              animated
              onChangeText={setEmail}
              value={email}
              label={translate("shares.share_folder.add_email")}
              clearButtonMode="unless-editing"
              clearTextOnFocus={true}
              onSubmitEditing={() => {
                addEmail(email)
              }}
            />
          </View>
        </View>
        <View
          style={{
            marginTop: 20,
          }}
        >
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
                  containerStyle={{
                    paddingHorizontal: 12,
                    alignItems: "center",
                  }}
                  onPress={() => removeEmail(e)}
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
                  onPress={() => setGroups(groups.filter((group) => group.id !== e.id))}
                  containerStyle={{
                    paddingHorizontal: 12,
                    alignItems: "center",
                  }}
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
        <TouchableOpacity onPress={() => addEmail(email)}>
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
              source={SHARE_AVATAR}
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
          <Text style={{ marginBottom: 20 }}>{translate("shares.suggestion")}</Text>
          {suggestions.map((e, index) => (
            <TouchableOpacity
              key={e + index.toString()}
              onPress={() => {
                if (e.email) {
                  addEmail(e.email)
                } else {
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
                }
              }}
            >
              <View
                style={{
                  borderBottomColor: colors.block,
                  borderBottomWidth: 1,
                  width: "100%",
                  flexDirection: "row",
                  paddingVertical: 8,
                  justifyContent: "flex-start",
                }}
              >
                <Image
                  resizeMode="contain"
                  source={e.email ? { uri: e.avatar } : SHARE_GROUP}
                  style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
                />

                <View style={{ flex: 1, justifyContent: "center" }}>
                  <Text text={e.email || e.name} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )

  const renderManageShare = () => (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text preset="bold" text={translate("shares.share_folder.share_with")} />
        <Button
          preset="teriatary"
          onPress={() => {
            setPage(0)
          }}
          text={translate("common.add")}
        />
      </View>

      <FlatList
        scrollEnabled={true}
        data={sharedData}
        keyExtractor={(_, index) => String(index)}
        ListEmptyComponent={() => (
          <View>
            <Text text={translate("shares.share_folder.no_shared_users")} />
          </View>
        )}
        renderItem={({ item }) => (
          <SharedUsers
            reload={reload}
            setReload={setReload}
            item={item}
            organizationId={selectedCipher.organizationId}
            onRemove={onRemove}
          />
        )}
      />
    </View>
  )
  return (
    <Screen
      header={
        <Header
          leftText={translate("common.cancel")}
          onLeftPress={() => navigation.goBack()}
          rightText={translate("common.done")}
          rightTextColor={emails?.length > 0 || groups.length > 0 ? colors.primary : colors.disable}
          onRightPress={() => {
            if (emails?.length > 0 || groups.length > 0) {
              handleShare()
            }
          }}
        />
      }
      contentContainerStyle={{
        flex: 1,
        padding: 16,
      }}
    >
      {page === 0 && renderAddUser()}
      {page === 1 && renderManageShare()}
    </Screen>
  )
})
