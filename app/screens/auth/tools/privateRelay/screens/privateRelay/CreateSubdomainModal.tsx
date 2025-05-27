import React, { useState } from "react"
import { StyleSheet, TextInput, View } from "react-native"
import { BottomModal, Button, Text } from "app/components/cores"
import { useStores } from "app/models"
import { useAppLocale, useTheme } from "app/services/context"
import { useHelper } from "app/services/hook"
import { SubdomainData } from "app/static/types"

interface Props {
  isOpen: boolean
  onClose: () => void
  setSubdomain: (payload: SubdomainData) => void
}

export const CreateSubdomainModal = (props: Props) => {
  const { isOpen, onClose } = props
  const { colors } = useTheme()
  const { notifyApiError } = useHelper()
  const { translate } = useAppLocale()
  const { toolStore } = useStores()

  const [isLoading, setIsLoading] = useState(false)
  const [subdomain, setSubdomain] = useState("")

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
      props.setSubdomain(data)
      onClose()
    } else {
      notifyApiError(res)
    }
    setIsLoading(false)
  }

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title={translate("private_relay.manage_subdomain.new")}
    >
      <View style={[styles.container, { borderColor: colors.primary }]}>
        <TextInput
          autoFocus
          onChangeText={setSubdomain}
          placeholder={"... "}
          placeholderTextColor={colors.secondaryText}
          selectionColor={colors.primary}
          style={{
            flex: 5,
            color: colors.title,
            fontSize: 16,
          }}
        />
        <Text text={".maily.org"} style={styles.domain} />
      </View>

      <Button
        loading={isLoading}
        disabled={!subdomain}
        style={styles.mt16}
        text={translate("common.confirm")}
        onPress={handleCreateSubdomain}
      />
    </BottomModal>
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
    marginTop: 16,
    paddingLeft: 12,
    paddingRight: 12,
  },
  domain: {
    marginLeft: 2,
    right: 0,
  },
  mt16: { marginTop: 16 },
})
