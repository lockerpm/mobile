import { FC, useState } from "react"
import { Image, StyleSheet, View } from "react-native"

import { BottomModalContainer, Button, ModalBackdrop, Text } from "app/components/cores"
import { SettingsScreenProps } from "app/navigators"
import { usePasskeyBackup } from "app/services/hook"
import { useToast } from "app/services/utils"
import { debounce } from "app/utils/utils"

import { useAppLocale } from "@/i18n"
import { AppEventType, EventBus } from "@/utils/eventBus"
import { useAppTheme } from "@/utils/useAppTheme"

const TRASH = require("assets/images/intro/trash.png")

export const PasskeyDeleteModalScreen: FC<SettingsScreenProps<"unlockPasskeyDelete">> = ({
  navigation,
  route: {
    params: { id, name, isPrimary },
  },
}) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()
  const { notifyTx, notifyApiError } = useToast()
  const { deletePasskey } = usePasskeyBackup()

  const [isLoading, setIsLoading] = useState(false)

  const onClose = debounce(navigation.goBack, 400)

  const handleDelete = async () => {
    setIsLoading(true)
    const res = await deletePasskey({ id, isPrimary })
    setIsLoading(false)
    if (res.kind === "ok") {
      notifyTx("success", "passkey:unlock.delete_success")
      EventBus.emit(AppEventType.PASSKEY_LIST_UPDATE, null)
    } else {
      notifyApiError(res)
    }
    onClose()
  }

  return (
    <View style={styles.flex}>
      <ModalBackdrop onPress={onClose} />

      <BottomModalContainer style={styles.container}>
        <Text
          preset="bold"
          size="md"
          text={translate("passkey:unlock.delete_title", {
            name: name || translate("passkey:unlock.unnamed"),
          })}
          style={styles.center}
        />
        <Image resizeMode="contain" source={TRASH} style={styles.image} />

        <Text preset="label" size="xs" tx="passkey:unlock.delete_desc" style={styles.center} />
        {isPrimary && (
          <Text
            size="xs"
            color={colors.error}
            tx="passkey:unlock.delete_primary_warning"
            style={[styles.center, styles.warning]}
          />
        )}

        <Button
          preset="delete"
          disabled={isLoading}
          loading={isLoading}
          onPress={handleDelete}
          tx="common:delete"
          style={styles.button}
        />
      </BottomModalContainer>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    marginTop: 24,
  },
  center: {
    textAlign: "center",
  },
  container: {
    paddingHorizontal: 16,
  },
  flex: {
    flex: 1,
    justifyContent: "flex-end",
  },
  image: {
    alignSelf: "center",
    height: 110,
    marginVertical: 12,
    width: 100,
  },
  warning: {
    marginTop: 8,
  },
})
