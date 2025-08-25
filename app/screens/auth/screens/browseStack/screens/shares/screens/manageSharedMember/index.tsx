import { Button, Header, Screen } from "@/components/cores"
import { ShareScreenProps } from "@/navigators"
import { useAppTheme } from "@/utils/useAppTheme"
import { FC, useCallback, useEffect, useState } from "react"
import { ActivityIndicator, FlatList, StyleSheet, View, ViewStyle } from "react-native"
import { Text } from "@/components/cores"
import { SharedGroupType, SharedMemberType } from "@/static/types"
import { SharedGroup } from "./SharedGroup"
import { SharedMember } from "./SharedMember"
import { observer } from "mobx-react-lite"
import { useStores } from "@/models"
import { useToast } from "@/services/utils"
import { ThemedStyle } from "@/theme"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { AppEventType, EventBus } from "@/utils/eventBus"
import { useCipherData } from "@/services/hook"

type MemberType =
  | {
      type: "group"
      data: SharedGroupType
    }
  | {
      type: "user"
      data: SharedMemberType
    }
export const ManageSharedMemberScreen: FC<ShareScreenProps<"manageSharedMember">> = observer(
  ({
    navigation,
    route: {
      params: { cipher, isFromShare = false },
    },
  }) => {
    const {
      themed,
      theme: { colors },
    } = useAppTheme()
    const { notifyApiError } = useToast()
    const { cipherStore } = useStores()
    const { stopShareCipher, stopShareCipherForGroup } = useCipherData()

    const [sharedUsers, setSharedUsers] = useState<SharedMemberType[]>([])

    const [sharedGroups, setSharedGroups] = useState<SharedGroupType[]>([])

    const [isLoading, setIsLoading] = useState(true)
    const [isStopSharing, setIsStopSharing] = useState(false)

    // ----------------------- COMPUTED -------------------------

    const sharedData: MemberType[] = (() => {
      const data: MemberType[] = []
      sharedGroups.forEach((e) => {
        data.push({
          type: "group",
          data: e,
        })
      })
      sharedUsers.forEach((e) => {
        data.push({
          type: "user",
          data: e,
        })
      })
      return data
    })()
    // ------------------------- METHODS --------------------------

    const navigateToNormalShare = useCallback(() => {
      if (isFromShare) {
        navigation.goBack()
        return
      }
      navigation.navigate("normalShare", {
        ciphers: [cipher],
      })
    }, [navigation, cipher, isFromShare])

    const navigateMemberActions = useCallback(
      (data: { member?: SharedMemberType; group?: SharedGroupType }) => {
        navigation.navigate("manageSharedMemberModal", {
          ...data,
          cipher,
        })
      },
      [cipher, navigation]
    )

    const getSharedUsers = async () => {
      setIsLoading(true)
      const res = await cipherStore.loadMyShares()
      if (res.kind !== "ok") {
        notifyApiError(res)
      }
      const share = cipherStore.myShares.find((s) => s.id === cipher.organizationId)
      if (share) {
        if (share.members.length > 0) setSharedUsers(share.members)

        if (share.groups.length > 0) setSharedGroups(share.groups)
      } else {
        navigation.goBack()
      }
      setIsLoading(false)
    }

    const handleStopShare = async () => {
      setIsStopSharing(true)
      if (sharedUsers.length > 0) {
        for (const user of sharedUsers) {
          // @ts-ignore
          await stopShareCipher(cipher, user.id)
        }
      }
      if (sharedGroups.length > 0) {
        for (const group of sharedGroups) {
          // @ts-ignore
          await stopShareCipherForGroup(cipher, group.id)
        }
      }
      setIsStopSharing(false)
      navigation.goBack()
    }
    // --------------------------EFFECT----------------------------
    useEffect(() => {
      getSharedUsers()
    }, [])

    useEffect(() => {
      const listener1 = EventBus.createListener(AppEventType.MANAGE_SHARE_MEMBER_UPDATE, () => {
        getSharedUsers()
      })

      return () => {
        EventBus.removeListener(listener1)
      }
    }, [])

    return (
      <Screen
        safeAreaEdges={["bottom"]}
        disableAvoidkeyboard
        header={
          <Header
            titleTx="shares:share_folder.manage_user"
            onLeftPress={navigation.goBack}
            leftIcon="arrow-left"
            rightTx="common:add"
            rightIconColor={colors.primary}
            onRightPress={navigateToNormalShare}
          />
        }
        footer={
          <Button
            loading={isStopSharing}
            disabled={isStopSharing}
            tx="shares:stop_sharing"
            onPress={handleStopShare}
            preset="delete"
            style={styles.footerButton}
          />
        }
        contentContainerStyle={styles.container}
      >
        {sharedData.length > 0 && (
          <Text tx={"shares:share_folder.share_with"} style={styles.ph16} />
        )}

        <FlatList
          data={sharedData}
          keyExtractor={(_, index) => String(index)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() =>
            !isLoading ? (
              <View>
                <Text tx={"shares:share_folder.no_shared_users"} style={styles.centerText} />
              </View>
            ) : (
              <ActivityIndicator color={colors.primary} />
            )
          }
          ItemSeparatorComponent={() => <View style={themed($divider)} />}
          renderItem={({ item }) => (
            <>
              {item.type === "group" && (
                <SharedGroup
                  item={item.data}
                  openActions={(item) => {
                    navigateMemberActions({
                      group: item,
                    })
                  }}
                />
              )}
              {item.type === "user" && (
                <SharedMember
                  item={item.data}
                  openActions={(item) => {
                    navigateMemberActions({
                      member: item,
                    })
                  }}
                />
              )}
            </>
          )}
        />
      </Screen>
    )
  }
)

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.border,
})
const styles = StyleSheet.create({
  centerText: {
    marginVertical: 16,
    textAlign: "center",
  },
  container: {
    flex: 1,
  },
  footerButton: {
    marginHorizontal: 16,
  },
  listContent: {
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom + 8,
    paddingHorizontal: 16,
  },
  ph16: {
    paddingHorizontal: 16,
  },
})
