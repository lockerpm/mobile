import { useCallback } from "react"
import { View, FlatList, StyleSheet, ViewStyle, Alert } from "react-native"
import { observer } from "mobx-react-lite"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon, PressableScale, Text } from "@/components/cores"
import { useAppLocale } from "@/i18n"
import { CipherAppView } from "@/static/types"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

import { LoginPasskeyListItem } from "./ListItem"

interface Props {
  ciphers: CipherAppView[]
  createNewCipher: () => void
  addOrReplaceCipherFido2Credential: (item: CipherAppView) => void
}

export const LoginContainPasskeyList = observer(
  ({ ciphers, createNewCipher, addOrReplaceCipherFido2Credential }: Props) => {
    const { themed } = useAppTheme()
    const insets = useSafeAreaInsets()
    const { translate } = useAppLocale()

    const isCiphersEmpty = ciphers.length === 0
    // ------------------------ PARAMS ----------------------------

    const replaceLoginFido2Credential = (item: CipherAppView) => {
      if (item.login.hasFido2Credentials) {
        Alert.alert(
          translate("autofill_service:android_service.create_passkey.replace_alert_t"),
          translate("autofill_service:android_service.create_passkey.replace_alert_d"),
          [
            {
              text: translate("common:cancel"),
              style: "cancel",
            },
            {
              text: translate("common:ok"),
              onPress: () => addOrReplaceCipherFido2Credential(item),
            },
          ]
        )
      } else {
        addOrReplaceCipherFido2Credential(item)
      }
    }

    const Header = useCallback(() => {
      return (
        <View style={styles.header}>
          <Text
            preset="label"
            text={translate(
              "autofill_service:android_service.create_passkey.action_header"
            ).toUpperCase()}
            size="xs"
            style={styles.createSectionHeader}
          />
          <PressableScale style={themed($createButton)} onPress={createNewCipher}>
            <Icon icon="person-key" size={24} style={styles.createButtonIcon} />
            <Text tx="autofill_service:android_service.create_passkey.action_btn" />
          </PressableScale>
          {!isCiphersEmpty && (
            <Text
              preset="label"
              text={translate(
                "autofill_service:android_service.create_passkey.replace_header"
              ).toUpperCase()}
              size="xs"
              style={styles.existingKeyHeader}
            />
          )}
        </View>
      )
    }, [isCiphersEmpty, createNewCipher])
    // ------------------------ RENDER ----------------------------

    return (
      <View>
        <Header />
        <FlatList
          data={ciphers}
          contentContainerStyle={[styles.listContent, { marginBottom: insets.bottom + 8 }]}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <LoginPasskeyListItem item={item} onPress={replaceLoginFido2Credential} />
          )}
          ItemSeparatorComponent={() => <View style={themed($divider)} />}
          getItemLayout={(data, index) => ({
            length: 71,
            offset: 71 * index,
            index,
          })}
        />
      </View>
    )
  }
)

const $divider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.border,
})

const $createButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.block,
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 12,
  flexDirection: "row",
  alignItems: "center",
})

const styles = StyleSheet.create({
  createButtonIcon: {
    marginRight: 12,
  },
  createSectionHeader: {
    marginBottom: 8,
    marginLeft: 8,
  },
  existingKeyHeader: {
    marginBottom: 8,
    marginLeft: 8,
    marginTop: 16,
  },
  header: {
    marginHorizontal: 16,
  },
  listContent: {
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 16,
    overflow: "hidden",
  },
})
