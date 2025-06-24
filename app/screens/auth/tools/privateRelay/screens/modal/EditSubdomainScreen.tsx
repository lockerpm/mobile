import React, { FC, useEffect, useRef, useState } from "react"
import { View, TextInput, KeyboardAvoidingView, StyleSheet } from "react-native"
import { Text, Button } from "app/components/cores"
import { useTheme } from "app/services/context"
import { useStores } from "app/models"
import { useHelper } from "app/services/hook"
import { PrivateRelayScreenProps } from "../../route"
import { IS_IOS } from "app/config/constants"
import { BlurView } from "@react-native-community/blur"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { BottomModalHeader } from "app/components/utils"

export const EditSubdomainScreen: FC<PrivateRelayScreenProps<"editSubdomain">> = ({
  navigation,
  route: {
    params: { subdomain },
  },
}) => {
  const { colors } = useTheme()
  const { toolStore } = useStores()
  const { translate, notifyApiError } = useHelper()

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

  const validNumberCharacters = domain.length >= 3 && domain.length <= 63
  const validSpecialCharacters = domain.length > 0 && /^[a-z0-9-]+$/.test(domain)

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

        <View style={styles.note}>
          <Text
            tx="private_relay.edit_modal.error.numberCharacters"
            color={validNumberCharacters ? colors.primary : colors.disable}
            size="small"
          />
          <Text
            tx="private_relay.edit_modal.error.special"
            color={validSpecialCharacters ? colors.primary : colors.disable}
            size="small"
          />
        </View>

        <Text
          preset="label"
          style={styles.mt16}
          size="base"
          text={translate("private_relay.manage_subdomain.edit_note")}
        />
        <Button
          loading={isLoading}
          disabled={!validNumberCharacters || !validSpecialCharacters}
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
  note: {
    marginVertical: 16,
  },
})
