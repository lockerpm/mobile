import { FC, useCallback, useState } from "react"
import { View, StyleSheet, ViewStyle, ScrollView } from "react-native"
import { Header, ImageIcon, PressableIcon, PressableText, Screen, Text } from "app/components/cores"
import { AccountRoleText } from "app/static/types"
import { useFolder } from "app/services/hook"
import { observer } from "mobx-react-lite"
import { ShareScreenProps } from "@/navigators"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { CollectionView } from "core/models/view/collectionView"
import { EmailInput } from "../startNormalShareConfig/EmailInput"

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
    const [emails, setEmails] = useState<string[]>([])
    const [groups, setGroups] = useState<{ name: string; id: string }[]>([])
    // --------------- COMPUTED ----------------

    const showManageShare = "organizationId" in folder && !!folder.organizationId

    // --------------- METHODS ----------------

    const removeEmail = (val: string) => {
      setEmails(emails.filter((e) => e !== val))
    }

    // Share single/multiple
    const handleShare = async () => {
      setIsSharing(true)
      let res
      if (folder instanceof CollectionView) {
        res = await shareFolderAddMember(folder, emails, AccountRoleText.MEMBER, true, groups)
      } else {
        res = await shareFolder(folder, emails, AccountRoleText.MEMBER, true, groups)
      }

      if (res.kind === "ok" || res.kind === "unauthorized") {
        navigation.goBack()
      }
      setIsSharing(false)
    }

    const navigateToManageMember = useCallback(() => {
      if (showManageShare) {
        navigation.navigate("manageFolderSharedMember", {
          collection: folder,
          isFromShare: true,
        })
      }
    }, [navigation, folder, showManageShare])

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
          {showManageShare && (
            <PressableText
              preset="bold"
              tx={"shares:share_folder.manage_user"}
              color={colors.primary}
              onPress={navigateToManageMember}
            />
          )}
        </View>

        <Text text="Share with:" style={styles.mv12} />
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          {emails.map((e, index) => {
            return (
              <View key={index} style={themed($shareMember)}>
                <Text text={e} style={styles.email} />
                <PressableIcon icon="trash" size={20} onPress={() => removeEmail(e)} />
              </View>
            )
          })}
          {groups.map((e, index) => {
            return (
              <View key={index} style={themed($shareMember)}>
                <Text text={e.name} style={styles.email} />
                <PressableIcon
                  icon="trash"
                  size={20}
                  onPress={() => setGroups(groups.filter((group) => group.id !== e.id))}
                />
              </View>
            )
          })}
        </ScrollView>
      </Screen>
    )
  }
)

const $shareMember: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 8,
  borderWidth: 0.5,
  borderColor: colors.border,
  backgroundColor: colors.block,
  paddingHorizontal: 16,
  marginBottom: 16,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 6,
})

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
})
