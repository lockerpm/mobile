import { FC, useCallback, useEffect, useState } from "react"
import { View, StyleSheet, ScrollView } from "react-native"
import { observer } from "mobx-react-lite"

import { Header, PressableText, Screen, Text } from "app/components/cores"
import { AccountRoleText, CipherAppView } from "app/static/types"

import { ShareScreenProps } from "@/navigators"
import { AppEventType, EventBus } from "@/utils/eventBus"
import { useAppTheme } from "@/utils/useAppTheme"

import { EmailInput } from "./EmailInput"
import { Group } from "./Group"
import { Member } from "./Member"
import { ShareCipherList } from "./ShareCipherList"
import { useShareMultipleCiphers } from "./useShareMultipleCiphers"

export const NormalSharesScreen: FC<ShareScreenProps<"normalShare">> = observer(
  ({
    navigation,
    route: {
      params: { ciphers = [] },
    },
  }) => {
    const {
      theme: { colors },
    } = useAppTheme()
    const { shareMultipleCiphers } = useShareMultipleCiphers()

    // --------------- PARAMS ----------------
    const [isSharing, setIsSharing] = useState(false)
    const [shareCiphers, setShareCiphers] = useState<CipherAppView[]>(ciphers)
    const [emails, setEmails] = useState<{ email: string; role: AccountRoleText }[]>([])
    const [groups, setGroups] = useState<{ name: string; id: string; role: AccountRoleText }[]>([])
    // --------------- COMPUTED ----------------

    const cipherIds = shareCiphers.map((c) => c.id)
    const selectedCipher = shareCiphers.length > 0 ? shareCiphers[0] : null

    const showManageShare = !!selectedCipher?.organizationId

    // --------------- METHODS ----------------

    const removeShareCipher = (item: CipherAppView) => {
      const newShareCipher = shareCiphers.filter((c) => c.id !== item.id)
      if (newShareCipher.length < 1) {
        navigation.goBack()
        return
      }
      setShareCiphers(shareCiphers.filter((c) => c.id !== item.id))
    }

    const removeEmail = (val: string) => {
      setEmails(emails.filter((e) => e.email !== val))
    }

    const removeGroup = (id: string) => {
      setGroups(groups.filter((group) => group.id !== id))
    }

    // Share single/multiple
    const handleShare = async () => {
      setIsSharing(true)

      const res = await shareMultipleCiphers(cipherIds, emails, groups, false)
      if (res.kind === "ok" || res.kind === "unauthorized") {
        EventBus.emit(AppEventType.MANAGE_SHARE_MEMBER_UPDATE, null)
        navigation.goBack()
      }
      setIsSharing(false)
    }

    const changeEmailRole = useCallback(
      (email: string, role: AccountRoleText) => {
        if (!email) {
          return
        }
        const temp = [...emails]
        const index = temp.findIndex((e) => e.email === email)

        if (index === -1 || temp[index].role === role) {
          return
        }
        temp[index].role = role
        setEmails(temp)
      },
      [emails]
    )

    const changeGroupRole = useCallback(
      (id: string, role: AccountRoleText) => {
        if (!id) {
          return
        }
        const temp = [...groups]
        const index = temp.findIndex((e) => e.id === id)
        if (index === -1 || temp[index].role === role) {
          return
        }
        temp[index].role = role
        setGroups(temp)
      },
      [groups]
    )

    const navigateToManageMember = useCallback(() => {
      if (!!selectedCipher && !!selectedCipher.organizationId) {
        navigation.navigate("manageSharedMember", {
          cipher: selectedCipher,
          isFromShare: true,
        })
      }
    }, [navigation, selectedCipher])

    const navigateToEditMember = useCallback(
      (id: string, val: string, role: AccountRoleText) => {
        navigation.navigate("editShareMemberPermissionModal", {
          id,
          value: val,
          role,
        })
      },
      [navigation]
    )

    // --------------------------EFFECT----------------------------

    useEffect(() => {
      const listener1 = EventBus.createListener(AppEventType.MANAGE_SHARE_MEMBER_UPDATE, (data) => {
        if (data) {
          changeEmailRole(data?.id, data?.role)
          changeGroupRole(data?.id, data?.role)
        }
      })

      return () => {
        EventBus.removeListener(listener1)
      }
    }, [changeEmailRole, changeGroupRole])

    // --------------- RENDER ----------------

    const disabled = (emails?.length < 1 && groups.length < 1) || isSharing
    return (
      <Screen
        safeAreaEdges={["bottom"]}
        header={
          <Header
            leftTx={"common:cancel"}
            titleTx="quick_shares:share_option.normal.tl"
            onLeftPress={navigation.goBack}
            rightLoading={isSharing}
            rightDisabled={disabled}
            onRightPress={handleShare}
            rightTx="common:done"
            rightIconColor={colors.primary}
          />
        }
        footer={
          <EmailInput groups={groups} setGroups={setGroups} emails={emails} setEmails={setEmails} />
        }
        contentContainerStyle={styles.screenContent}
      >
        <View style={styles.header}>
          <Text
            tx={shareCiphers.length > 1 ? "shares:share_x_items" : "shares:share_x_item"}
            txOptions={{ count: shareCiphers.length }}
            style={styles.email}
          />
          {showManageShare && (
            <PressableText
              preset="bold"
              tx={"shares:share_folder.manage_user"}
              color={colors.primary}
              onPress={navigateToManageMember}
            />
          )}
        </View>

        <ShareCipherList ciphers={shareCiphers} removeShareCipher={removeShareCipher} />

        <Text tx="common:shareWith" style={styles.mv12} />
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          {emails.map((e, index) => {
            return (
              <Member
                member={e}
                key={index}
                removeEmail={removeEmail}
                navigateToEditMember={navigateToEditMember}
              />
            )
          })}
          {groups.map((e, index) => {
            return (
              <Group
                group={e}
                key={index}
                removeGroup={removeGroup}
                navigateToEditGroup={navigateToEditMember}
              />
            )
          })}
        </ScrollView>
      </Screen>
    )
  }
)

const styles = StyleSheet.create({
  cipherContent: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  disableAdd: {
    opacity: 0.5,
  },
  email: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  emailInputContainer: {
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerContent: {
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: 12,
  },
  input: {
    flex: 1,
    marginRight: 12,
  },
  mh4: {
    marginHorizontal: 4,
  },
  mt20: {
    marginTop: 20,
  },
  mv12: {
    marginVertical: 12,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  screenContent: {
    flex: 1,
    paddingHorizontal: 16,
  },

  shareAvatar: { borderRadius: 20, height: 40, marginRight: 12, width: 40 },
})
