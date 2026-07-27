import { FC, useCallback, useEffect, useState } from "react"
import { View, StyleSheet, ViewStyle, ScrollView } from "react-native"
import { observer } from "mobx-react-lite"

import { Header, ImageIcon, PressableText, Screen, Text } from "app/components/cores"
import { useFolder } from "app/services/hook"
import { AccountRoleText, ShareGroups, ShareMembers } from "app/static/types"
import { CollectionView } from "core/models/view/collectionView"

import { ShareScreenProps } from "@/navigators"
import { ThemedStyle } from "@/theme"
import { AppEventType, EventBus } from "@/utils/eventBus"
import { useAppTheme } from "@/utils/useAppTheme"

import { EmailInput } from "../startNormalShareConfig/EmailInput"
import { Group } from "../startNormalShareConfig/Group"
import { Member } from "../startNormalShareConfig/Member"

export const FolderSharesScreen: FC<ShareScreenProps<"folderShare">> = observer(
  ({
    navigation,
    route: {
      params: { folder },
    },
  }) => {
    const {
      themed,
      theme: { colors },
    } = useAppTheme()
    const { shareFolder, shareFolderAddMember } = useFolder()

    // --------------- PARAMS ----------------
    const [isSharing, setIsSharing] = useState(false)
    const [emails, setEmails] = useState<ShareMembers[]>([])
    const [groups, setGroups] = useState<ShareGroups[]>([])
    // --------------- COMPUTED ----------------

    const showManageShare = "organizationId" in folder && !!folder.organizationId

    // --------------- METHODS ----------------

    const removeEmail = useCallback(
      (val: string) => {
        setEmails(emails.filter((e) => e.email !== val))
      },
      [emails]
    )

    const removeGroup = useCallback(
      (id: string) => {
        setGroups(groups.filter((group) => group.id !== id))
      },
      [groups]
    )

    // Share single/multiple
    const handleShare = async () => {
      setIsSharing(true)
      let res
      if (showManageShare || folder instanceof CollectionView) {
        res = await shareFolderAddMember(folder, emails, groups)
      } else {
        res = await shareFolder(folder, emails, groups)
      }

      if (res.kind === "ok" || res.kind === "unauthorized") {
        EventBus.emit(AppEventType.MANAGE_SHARE_MEMBER_UPDATE, null)
        navigation.goBack()
      }
      setIsSharing(false)
    }

    const changeEmailRole = useCallback(
      (email: string, role: AccountRoleText, hidePasswords: boolean) => {
        if (!email) {
          return
        }
        const temp = [...emails]
        const index = temp.findIndex((e) => e.email === email)

        if (index === -1) {
          return
        }
        temp[index].role = role
        temp[index].hidePasswords = hidePasswords
        setEmails(temp)
      },
      [emails]
    )

    const changeGroupRole = useCallback(
      (id: string, role: AccountRoleText, hidePasswords: boolean) => {
        if (!id) {
          return
        }
        const temp = [...groups]
        const index = temp.findIndex((e) => e.id === id)
        if (index === -1) {
          return
        }
        temp[index].role = role
        temp[index].hidePasswords = hidePasswords
        setGroups(temp)
      },
      [groups]
    )

    const navigateToManageMember = useCallback(() => {
      if (showManageShare) {
        navigation.navigate("manageFolderSharedMember", {
          collection: folder,
          isFromShare: true,
        })
      }
    }, [navigation, folder, showManageShare])

    const navigateToEditMember = useCallback(
      (id: string, val: string, role: AccountRoleText, hidePasswords: boolean) => {
        navigation.navigate("editShareMemberPermissionModal", {
          id,
          value: val,
          role,
          hidePasswords,
          isHaveLoginItem: true,
        })
      },
      [navigation]
    )

    // --------------------------EFFECT----------------------------

    useEffect(() => {
      const listener1 = EventBus.createListener(AppEventType.MANAGE_SHARE_MEMBER_UPDATE, (data) => {
        if (data) {
          changeEmailRole(data?.id, data?.role, data?.hidePasswords)
          changeGroupRole(data?.id, data?.role, data?.hidePasswords)
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
          <View style={themed($folder)}>
            <ImageIcon icon={"folder"} size={24} />
            <Text preset="bold" text={folder.name} numberOfLines={2} style={styles.ml12} />
          </View>
        </View>

        <View style={styles.shareWidth}>
          <Text tx="common:shareWith" />
          {showManageShare && (
            <PressableText
              preset="bold"
              tx={"shares:share_folder.manage_user"}
              color={colors.primary}
              onPress={navigateToManageMember}
            />
          )}
        </View>
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

const $folder: ThemedStyle<ViewStyle> = ({ colors }) => ({
  alignItems: "center",
  flexDirection: "row",
  width: "100%",
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 12,
})

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
  ml12: {
    marginLeft: 12,
  },
  mt20: {
    marginTop: 20,
  },
  mv12: {
    marginVertical: 12,
  },
  screenContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  shareAvatar: { borderRadius: 20, height: 40, marginRight: 12, width: 40 },

  shareWidth: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
})
