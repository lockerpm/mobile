import React, { FC, useEffect, useRef, useState } from "react"
import { View, TextInput, KeyboardAvoidingView, StyleSheet } from "react-native"
import { Text, Button } from "app/components/cores"
import { useAppLocale, useTheme } from "app/services/context"
import { useStores } from "app/models"
import { useHelper } from "app/services/hook"
import { IS_IOS } from "app/config/constants"
import { BlurView } from "@react-native-community/blur"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { BottomModalHeader } from "app/components/utils"
import { PrivateRelayScreenProps } from "app/navigators"
import { useToast } from "app/services/utils"

export const EditSubdomainScreen: FC<PrivateRelayScreenProps<"editSubdomain">> = ({
  navigation,
  route: {
    params: { subdomain },
  },
}) => {
  const { colors } = useTheme()
  const { toolStore } = useStores()
  const { notifyApiError } = useToast()
  const { translate } = useAppLocale()

  const inputRef = useRef<TextInput>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [domain, setDomain] = useState("")

  const handleUpdateSubdomain = async () => {
    setIsLoading(true)
    const res = await toolStore.editSubdomain(subdomain.id, domain.toLocaleLowerCase().trim())
    setIsLoading(false)
    if (res.kind === "ok") {
      EventBus.emit(AppEventType.PRIVATE_RELAY_DOMAIN, domain)
    } else if (res.kind === "bad-data") {
      notifyApiError(res)
    }
    navigation.navigate("relay")
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
    <KeyboardAvoidingView behavior={IS_IOS ? "padding" : undefined} style={styles.flex}>
      <BlurView
        onTouchEnd={navigation.goBack}
        blurType={"dark"}
        blurAmount={0}
        // @ts-ignore
        blurRadius={10}
        overlayColor="rgba(0,0,0,0.1)"
        style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.transparent }]}
      />
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <BottomModalHeader
          title={translate("private_relay.manage_subdomain.edit_btn")}
          onClose={navigation.goBack}
        />
        <Text preset="bold" text={`@${subdomain.subdomain}.maily.org`} />

        <Text tx={"private_relay.manage_subdomain.new"} style={styles.mt16} />
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
            placeholderTextColor={colors.secondaryText}
            selectionColor={colors.primary}
            style={{
              flexGrow: 1,
              flexShrink: 1,
              color: colors.title,
              fontSize: 16,
            }}
          />
          <Text text={".maily.org"} style={styles.domain} />
        </View>

        <Text
          preset="label"
          style={styles.mt16}
          text={translate("private_relay.manage_subdomain.edit_note")}
        />
        <Button
          loading={isLoading}
          disabled={!domain}
          style={styles.mt16}
          text={translate("common.confirm")}
          onPress={handleUpdateSubdomain}
        />
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
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom + (IS_IOS ? 0 : 16),
    paddingHorizontal: 16,
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
})
