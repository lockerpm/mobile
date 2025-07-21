import { useEffect, useState } from "react"
import { BottomModal, Button, Text, TextInput } from "app/components/cores"
import { useCipherData, useCipherHelper } from "app/services/hook"
import { CipherView, LoginView } from "core/models/view"
import Animated, { FadeIn } from "react-native-reanimated"
import { useClipboard } from "app/services/utils"
import { NewActionSheetItem } from "app/components/utils"
import { StyleSheet } from "react-native"
import { CipherAppView } from "@/static/types"

interface Props {
  isOpen: boolean
  onClose: () => void
  onRestore: () => void
  selectPassword?: string
  selectedCipher: CipherAppView
}

export const HistoryItemAction = ({
  isOpen,
  onClose,
  selectPassword,
  selectedCipher,
  onRestore,
}: Props) => {
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
      selectedCipher.collectionIds
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
      tx={isRestore ? "password_history:restore" : undefined}
    >
      {!isRestore && (
        <Animated.View>
          <NewActionSheetItem
            bottomBorder
            tx="password_history:copy"
            icon={"copy"}
            onPress={() => {
              copyToClipboard(selectPassword)
              onClose()
            }}
          />
          <NewActionSheetItem
            tx="password_history:restore"
            icon={"arrow-clockwise"}
            onPress={() => {
              setIsRestore(true)
            }}
          />
        </Animated.View>
      )}
      {isRestore && (
        <Animated.View entering={FadeIn}>
          <Text
            tx="password_history:restore_note"
            preset="label"
            size="sm"
            style={styles.restore}
          />
          <TextInput
            value={selectPassword}
            editable={false}
            isPassword
            containerStyle={styles.input}
          />
          <Button
            disabled={isLoading}
            loading={isLoading}
            tx={"password_history:restore_btn"}
            onPress={restorePassword}
          />
        </Animated.View>
      )}
    </BottomModal>
  )
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 24,
    marginVertical: 12,
  },
  restore: {
    marginVertical: 12,
  },
})
