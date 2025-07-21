/* eslint-disable react-native/no-inline-styles */
import { FC, useEffect, useRef, useState } from "react"
// eslint-disable-next-line no-restricted-imports
import { View, TextInput, KeyboardAvoidingView, StyleSheet, Platform } from "react-native"
import { Text, Button, BottomModalHeader, ModalBackdrop } from "app/components/cores"
import { useStores } from "app/models"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { PrivateRelayScreenProps } from "app/navigators"
import { useToast } from "app/services/utils"
import { useAppTheme } from "@/utils/useAppTheme"
import { debounce } from "@/utils/utils"

export const EditSubdomainScreen: FC<PrivateRelayScreenProps<"editSubdomain">> = ({
  navigation,
  route: {
    params: { subdomain },
  },
}) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { toolStore } = useStores()
  const { notifyApiError } = useToast()

  const inputRef = useRef<TextInput>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [domain, setDomain] = useState("")

  const onClose = debounce(navigation.goBack, 250)

  const handleUpdateSubdomain = async () => {
    setIsLoading(true)
    const res = await toolStore.editSubdomain(subdomain.id, domain.toLocaleLowerCase().trim())
    setIsLoading(false)
    if (res.kind === "ok") {
      EventBus.emit(AppEventType.PRIVATE_RELAY_DOMAIN_EDIT, domain)
    } else if (res.kind === "bad-data") {
      notifyApiError(res)
    }
    onClose()
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 200)
    return () => {
      clearTimeout(timer)
    }
  }, [])

  const validNumberCharacters = domain.length >= 3 && domain.length <= 63
  const validSpecialCharacters = domain.length > 0 && /^[a-z0-9-]+$/.test(domain)

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.flex}
    >
      <ModalBackdrop onPress={onClose} />
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <BottomModalHeader tx={"private_relay:manage_subdomain.edit_btn"} onClose={onClose} />

        <View style={styles.ph16}>
          <Text preset="bold" text={`@${subdomain.subdomain}.maily.org`} />

          <Text tx={"private_relay:manage_subdomain.new"} style={styles.mt16} />
          <View
            style={[
              styles.container,
              {
                borderColor: colors.primary,
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              autoCorrect={false}
              autoCapitalize="none"
              autoComplete="off"
              onChangeText={setDomain}
              placeholder={"..."}
              placeholderTextColor={colors.label}
              selectionColor={colors.primary}
              style={{
                flexGrow: 1,
                flexShrink: 1,
                color: colors.text,
                fontSize: 16,
              }}
            />
            <Text text={".maily.org"} style={styles.domain} />
          </View>

          <View style={styles.note}>
            <Text
              tx="private_relay:manage_subdomain.domain_error"
              color={validNumberCharacters ? colors.primary : colors.disable}
              size="xs"
            />
            <Text
              tx="private_relay:edit_modal.error.special"
              color={validSpecialCharacters ? colors.primary : colors.disable}
              size="xs"
            />
          </View>

          <Text
            preset="label"
            style={styles.mt16}
            size="sm"
            tx={"private_relay:manage_subdomain.edit_note"}
          />
          <Button
            loading={isLoading}
            disabled={!validNumberCharacters || !validSpecialCharacters}
            style={styles.mt16}
            tx={"common:confirm"}
            onPress={handleUpdateSubdomain}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    height: 44,
    justifyContent: "space-between",
    marginTop: 12,
    paddingLeft: 12,
    paddingRight: 12,
  },
  content: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom + (Platform.OS === "ios" ? 0 : 16),
  },
  domain: {
    marginLeft: 2,
    right: 0,
  },
  flex: {
    flex: 1,
    justifyContent: "flex-end",
  },
  mt16: { marginTop: 16 },
  note: {
    marginVertical: 16,
  },
  ph16: {
    paddingHorizontal: 16,
  },
})
