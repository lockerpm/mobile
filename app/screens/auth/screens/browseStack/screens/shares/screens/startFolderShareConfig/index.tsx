import { FC, useCallback, useEffect, useState } from "react"
import { View, StyleSheet, ViewStyle, ScrollView } from "react-native"
import { Header, ImageIcon, PressableText, Screen, Text } from "app/components/cores"
import { AccountRoleText } from "app/static/types"
import { useFolder } from "app/services/hook"
import { observer } from "mobx-react-lite"
import { ShareScreenProps } from "@/navigators"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { CollectionView } from "core/models/view/collectionView"
import { EmailInput } from "../startNormalShareConfig/EmailInput"
import { AppEventType, EventBus } from "@/utils/eventBus"
import { Member } from "../startNormalShareConfig/Member"
import { Group } from "../startNormalShareConfig/Group"

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
    const [emails, setEmails] = useState<
      {
        email: string
        role: AccountRoleText
      }[]
    >([])
    const [groups, setGroups] = useState<
      {
        name: string
        id: string
        role: AccountRoleText
      }[]
    >([])
    // --------------- COMPUTED ----------------

    const showManageShare = "organizationId" in folder && !!folder.organizationId

    // --------------- METHODS ----------------

    const removeEmail = (val: string) => {
      setEmails(emails.filter((e) => e.email !== val))
    }

    const removeGroup = (id: string) => {
      setGroups(groups.filter((group) => group.id !== id))
    }

    // Share single/multiple
    const handleShare = async () => {
      setIsSharing(true)
      let res
      if (showManageShare || folder instanceof CollectionView) {
        res = await shareFolderAddMember(folder, emails, groups, true)
      } else {
        res = await shareFolder(folder, emails, groups, true)
      }

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
      if (showManageShare) {
        navigation.navigate("manageFolderSharedMember", {
          collection: folder,
          isFromShare: true,
        })
      }
    }, [navigation, folder, showManageShare])

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
        console.log(data)
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
