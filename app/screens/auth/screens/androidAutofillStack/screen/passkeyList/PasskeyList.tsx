import { useCallback } from "react"
import { View, FlatList, StyleSheet, ViewStyle, BackHandler } from "react-native"
import { observer } from "mobx-react-lite"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button, Icon, Text } from "@/components/cores"
import { CipherAppView } from "@/static/types"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

import { LoginPasskeyListItem } from "../createPasskey/ListItem"

interface Props {
  isLoading: boolean
  rpId: string
  ciphers: CipherAppView[]
  selectPasskey: (item: CipherAppView) => void
}

export const PasskeyList = observer(({ rpId, isLoading, ciphers, selectPasskey }: Props) => {
  const { themed } = useAppTheme()
  const insets = useSafeAreaInsets()

  // ------------------------ PARAMS ----------------------------

  // ------------------------ RENDER ----------------------------
  const Empty = useCallback(() => <ListEmptyComponent rpId={rpId} />, [rpId])
  return (
    <FlatList
      data={ciphers}
      contentContainerStyle={[styles.listContent, { marginBottom: insets.bottom + 8 }]}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <LoginPasskeyListItem item={item} onPress={selectPasskey} />}
      ItemSeparatorComponent={() => <View style={themed($divider)} />}
      getItemLayout={(data, index) => ({
        length: 71,
        offset: 71 * index,
        index,
      })}
      ListEmptyComponent={isLoading ? undefined : Empty}
    />
  )
})

const ListEmptyComponent = ({ rpId }: { rpId: string }) => {
  const { themed } = useAppTheme()
  return (
    <View style={themed($empty)}>
      <Icon icon="lock-key" size={40} />
      <Text
        preset="bold"
        size="lg"
        tx="autofill_service:android_service.list_passkey.empty_title"
      />
      <Text
        preset="label"
        size="sm"
        tx="autofill_service:android_service.list_passkey.empty_label"
        style={styles.centerText}
        txOptions={{ rpId }}
      />
      <Button tx="common:ok" onPress={BackHandler.exitApp} style={styles.emptyButton} />
    </View>
  )
}

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.background,
})

const $empty: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginHorizontal: 16,
  padding: 16,
  borderRadius: 12,
  alignItems: "center",
  gap: 8,
  justifyContent: "center",
  marginTop: 32,
  backgroundColor: colors.block,
})

const styles = StyleSheet.create({
  centerText: {
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 16,
    width: 137,
  },
  listContent: {
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: "hidden",
  },
})
