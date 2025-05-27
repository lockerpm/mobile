import React, { useEffect, useState } from "react"
import { BottomModal, Button, Text, TextInput } from "app/components/cores"
import { ActionItem } from "app/components/ciphers"
import { useAppLocale, useTheme } from "app/services/context"
import { useCipherData, useCipherHelper } from "app/services/hook"
import { CipherView, LoginView } from "core/models/view"
import Animated, { FadeIn } from "react-native-reanimated"
import { useClipboard } from "app/services/utils"

interface Props {
  isOpen: boolean
  onClose: () => void
  onRestore: () => void
  selectPassword: string
  selectedCipher: CipherView
}

export const HistoryItemAction = ({
  isOpen,
  onClose,
  selectPassword,
  selectedCipher,
  onRestore,
}: Props) => {
  const { colors } = useTheme()
  const { translate } = useAppLocale()
  const { copyToClipboard } = useClipboard()
  const { updateCipher } = useCipherData()
  const { getPasswordStrength } = useCipherHelper()

  const [isRestore, setIsRestore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setIsRestore(false)
    }
  }, [isOpen])

  const restorePassword = async () => {
    setIsLoading(true)
    // @ts-ignore
    const payload: CipherView = { ...selectedCipher }

    const data = new LoginView()
    data.username = payload.login.username
    data.password = selectPassword
    data.totp = payload.login.totp
    data.uris = payload.login.uris

    payload.login = data
    const passwordStrength = getPasswordStrength(selectPassword).score
    const res = await updateCipher(
      payload.id,
      payload,
      passwordStrength,
      selectedCipher.collectionIds,
    )
    if (res.kind === "ok") {
      setIsLoading(false)
      onRestore()
    }
    setIsLoading(false)
  }
  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      hideCloseBtn={!isRestore}
      title={isRestore ? translate("password_history.restore") : ""}
    >
      {!isRestore && (
        <Animated.View>
          <ActionItem
            name={translate("password_history.copy")}
            icon={"copy"}
            action={() => {
              copyToClipboard(selectPassword)
              onClose()
            }}
            containerStyle={{
              paddingHorizontal: 0,
              borderBottomColor: colors.border,
              borderBottomWidth: 1,
            }}
          />
          <ActionItem
            name={translate("password_history.restore")}
            icon={"arrow-clockwise"}
            action={() => {
              setIsRestore(true)
            }}
            containerStyle={{ paddingHorizontal: 0 }}
          />
        </Animated.View>
      )}
      {isRestore && (
        <Animated.View entering={FadeIn}>
          <Text
            tx="password_history.restore_note"
            preset="label"
            size="base"
            style={{ marginVertical: 12 }}
          />
          <TextInput
            value={selectPassword}
            editable={false}
            isPassword
            containerStyle={{ marginVertical: 12, marginBottom: 24 }}
          />
          <Button
            disabled={isLoading}
            loading={isLoading}
            text={translate("password_history.restore_btn")}
            onPress={restorePassword}
          />
        </Animated.View>
      )}
    </BottomModal>
  )
}
