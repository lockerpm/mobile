import { FC, useEffect, useState } from "react"
import { FlatList, RefreshControl, StyleSheet, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"

import { Header, Icon, PressableScale, Screen, Text } from "app/components/cores"
import { SettingsScreenProps } from "app/navigators"
import { usePasskeyBackup } from "app/services/hook"
import { PasskeyItem } from "app/static/types"

import { ThemedStyle } from "@/theme"
import { AppEventType, EventBus } from "@/utils/eventBus"
import { useAppTheme } from "@/utils/useAppTheme"

import { PasskeyListItem } from "./PasskeyListItem"

export const PasskeyListScreen: FC<SettingsScreenProps<"unlockPasskeys">> = observer(
  ({ navigation }) => {
    const {
      themed,
      theme: { colors },
    } = useAppTheme()
    const { getPasskeys } = usePasskeyBackup()

    // ----------------------- PARAMS -----------------------

    const [passkeys, setPasskeys] = useState<PasskeyItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // ----------------------- METHODS -----------------------

    const fetchPasskeys = async () => {
      const res = await getPasskeys()
      if (res) {
        setPasskeys(res)
      }
    }

    const handleRefresh = async () => {
      setIsRefreshing(true)
      await fetchPasskeys()
      setIsRefreshing(false)
    }

    const navigateCreatePasskey = () => {
      navigation.navigate("unlockPasskeyCreate")
    }

    const navigateDeletePasskey = (item: PasskeyItem) => {
      navigation.navigate("unlockPasskeyDelete", {
        id: item.id,
        name: item.name,
        isPrimary: item.isPrimary,
      })
    }

    // ----------------------- EFFECT -----------------------

    useEffect(() => {
      fetchPasskeys().finally(() => setIsLoading(false))
    }, [])

    useEffect(() => {
      const listener = EventBus.createListener(AppEventType.PASSKEY_LIST_UPDATE, () => {
        fetchPasskeys()
      })

      return () => {
        EventBus.removeListener(listener)
      }
    }, [])

    // ----------------------- RENDER -----------------------

    return (
      <Screen
        safeAreaEdges={["bottom"]}
        disableAvoidkeyboard
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            titleTx="passkey:unlock.title"
            rightLoading={isLoading}
          />
        }
        backgroundColor={colors.block}
        contentContainerStyle={styles.container}
      >
        <FlatList
          data={passkeys}
          keyExtractor={(item) => (item.isPrimary ? "primary" : item.id)}
          renderItem={({ item, index }) => (
            <PasskeyListItem
              item={item}
              onDelete={navigateDeletePasskey}
              isFirst={index === 0}
              isLast={index === passkeys.length - 1}
            />
          )}
          ItemSeparatorComponent={() => <View style={themed($divider)} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text preset="label" size="xs" tx="passkey:unlock.description" />
              <PressableScale onPress={navigateCreatePasskey} style={themed($button)}>
                <Icon icon="plus" size={20} />
                <Text weight="medium" tx="passkey:unlock.add" />
              </PressableScale>
            </View>
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.empty}>
                <Text preset="label" size="xs" tx="passkey:unlock.empty" style={styles.center} />
              </View>
            ) : undefined
          }
        />
      </Screen>
    )
  }
)

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginHorizontal: 16,
  height: 1,
  backgroundColor: colors.border,
})

const $button: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginTop: 16,
  paddingVertical: 12,
  paddingHorizontal: 16,
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  borderRadius: 16,
  backgroundColor: colors.background,
})

const styles = StyleSheet.create({
  center: {
    textAlign: "center",
  },
  container: {
    flex: 1,
  },
  empty: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  listHeader: {
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
})
