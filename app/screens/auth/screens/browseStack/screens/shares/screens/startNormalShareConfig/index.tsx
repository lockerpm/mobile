import { FC, useCallback, useState } from "react"
import { View, StyleSheet, ViewStyle, ScrollView } from "react-native"
import { Header, PressableIcon, PressableText, Screen, Text } from "app/components/cores"
import { AccountRoleText, CipherAppView } from "app/static/types"
import { useCipherData } from "app/services/hook"
import { observer } from "mobx-react-lite"
import { ShareScreenProps } from "@/navigators"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { EmailInput } from "./EmailInput"
import { ShareCipherList } from "./ShareCipherList"

export const NormalSharesScreen: FC<ShareScreenProps<"normalShare">> = observer(
  ({
    navigation,
    route: {
      params: { ciphers = [] },
    },
  }) => {
    const {
      themed,
      theme: { colors },
    } = useAppTheme()
    const { shareMultipleCiphers } = useCipherData()

    // --------------- PARAMS ----------------
    const [isSharing, setIsSharing] = useState(false)
    const [shareCiphers, setShareCiphers] = useState<CipherAppView[]>(ciphers)
    const [emails, setEmails] = useState<string[]>([])
    const [groups, setGroups] = useState<{ name: string; id: string }[]>([])
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
      setEmails(emails.filter((e) => e !== val))
    }

    // Share single/multiple
    const handleShare = async () => {
      setIsSharing(true)

      const res = await shareMultipleCiphers(
        cipherIds,
        emails,
        AccountRoleText.MEMBER,
        false,
        groups
      )
      if (res.kind === "ok" || res.kind === "unauthorized") {
        navigation.goBack()
      }
      setIsSharing(false)
    }

    const navigateToManageMember = useCallback(() => {
      if (!!selectedCipher && !!selectedCipher.organizationId) {
        navigation.navigate("manageSharedMember", {
          cipher: selectedCipher,
          isFromShare: true,
        })
      }
    }, [navigation, selectedCipher])

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
            tx={"shares:share_x_items"}
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
