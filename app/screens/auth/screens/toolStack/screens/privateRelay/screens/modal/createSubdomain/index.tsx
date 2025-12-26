/* eslint-disable no-restricted-imports */
import { FC, useEffect, useRef, useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TextStyle,
  View,
} from "react-native"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

import { BottomModalHeader, Button, ModalBackdrop, Text } from "app/components/cores"
import { useStores } from "app/models"
import { useToast } from "app/services/utils"
import { SubdomainData } from "app/static/types"

import { PrivateRelayScreenProps } from "@/navigators"
import { ThemedStyle } from "@/theme"
import { AppEventType, EventBus } from "@/utils/eventBus"
import { useAppTheme } from "@/utils/useAppTheme"
import { debounce } from "@/utils/utils"

export const CreateSubdomainScreen: FC<PrivateRelayScreenProps<"createSubdomain">> = ({
  navigation,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { notifyApiError } = useToast()
  const { toolStore } = useStores()

  const [isLoading, setIsLoading] = useState(false)
  const [subdomain, setSubdomain] = useState("")
  const inputRef = useRef<TextInput>(null)

  const onClose = debounce(navigation.goBack, 250)

  const handleCreateSubdomain = async () => {
    setIsLoading(true)
    const res = await toolStore.createSubdomain(subdomain.toLowerCase().trim())
    if (res.kind === "ok") {
      const data: SubdomainData = {
        ...res.data,
        num_alias: 0,
        num_forwarded: 0,
        num_spam: 0,
        created_time: Date.now(),
      }
      // props.setSubdomain(data)
      EventBus.emit(AppEventType.PRIVATE_RELAY_DOMAIN_CREATE, data)
      onClose()
    } else {
      notifyApiError(res)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 200)
    return () => {
      clearTimeout(timer)
    }
  }, [])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.flex}
    >
      <ModalBackdrop onPress={onClose} />
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <BottomModalHeader tx={"private_relay:manage_subdomain.new"} onClose={onClose} />

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
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setSubdomain}
            placeholder={"... "}
            placeholderTextColor={colors.label}
            selectionColor={colors.primary}
            style={themed($input)}
          />
          <Text text={".maily.org"} style={styles.domain} />
        </View>
        <Button
          loading={isLoading}
          disabled={!subdomain}
          style={styles.mt16}
          tx={"common:confirm"}
          onPress={handleCreateSubdomain}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

const $input: ThemedStyle<TextStyle> = ({ colors }) => ({
  flex: 5,
  color: colors.title,
  fontSize: 16,
})

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    height: 44,
    justifyContent: "space-between",
    marginHorizontal: 16,
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
  mt16: { marginHorizontal: 16, marginTop: 16 },
})
