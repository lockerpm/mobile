import { FC, useEffect, useState } from "react"
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native"
import DeviceInfo from "react-native-device-info"

import {
  BottomModalContainer,
  BottomModalHeader,
  Button,
  ModalBackdrop,
  Text,
  TextInput,
} from "app/components/cores"
import { SettingsScreenProps } from "app/navigators"
import { usePasskeyBackup } from "app/services/hook"
import { useToast } from "app/services/utils"
import { debounce } from "app/utils/utils"

import { AppEventType, EventBus } from "@/utils/eventBus"

const IS_IOS = Platform.OS === "ios"

export const PasskeyCreateModalScreen: FC<SettingsScreenProps<"unlockPasskeyCreate">> = ({
  navigation,
}) => {
  const { notifyTx } = useToast()
  const { verifyMasterPassword, createPasskey } = usePasskeyBackup()

  // ---------------- PARAMS -----------------

  const [name, setName] = useState("")
  const [masterPassword, setMasterPassword] = useState("")
  const [isInvalidPassword, setIsInvalidPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const onClose = debounce(navigation.goBack, 400)

  // --------------- METHODS ----------------

  const handleCreate = async () => {
    if (isLoading || !name.trim() || !masterPassword) {
      return
    }
    Keyboard.dismiss()
    setIsLoading(true)

    const isValid = await verifyMasterPassword(masterPassword)
    if (!isValid) {
      setIsInvalidPassword(true)
      setIsLoading(false)
      return
    }

    const isCreated = await createPasskey(name.trim())
    setIsLoading(false)
    if (isCreated) {
      notifyTx("success", "passkey:unlock.create_success")
      EventBus.emit(AppEventType.PASSKEY_LIST_UPDATE, null)
      onClose()
    }
  }

  // ---------------- EFFECT -----------------

  useEffect(() => {
    DeviceInfo.getDeviceName().then((deviceName) => {
      setName((prev) => prev || deviceName)
    })
  }, [])

  // ---------------- RENDER -----------------

  return (
    <KeyboardAvoidingView
      behavior={IS_IOS ? "padding" : "height"}
      keyboardVerticalOffset={0}
      style={styles.flex}
    >
      <View style={styles.flex}>
        <ModalBackdrop onPress={onClose} />

        <BottomModalContainer>
          <BottomModalHeader tx="passkey:unlock.add" onClose={onClose} />

          <View style={styles.container}>
            <Text preset="label" size="xs" tx="passkey:unlock.create_desc" />

            <TextInput
              animated
              labelTx="passkey:unlock.name"
              value={name}
              onChangeText={setName}
              containerStyle={styles.input}
            />

            <TextInput
              animated
              isPassword
              labelTx="common:master_pass"
              isError={isInvalidPassword}
              helperTx="error:incorrect_pw"
              value={masterPassword}
              onChangeText={(text) => {
                setMasterPassword(text)
                setIsInvalidPassword(false)
              }}
              onSubmitEditing={handleCreate}
              containerStyle={styles.input}
            />

            <Button
              tx="common:create"
              disabled={isLoading || !name.trim() || !masterPassword}
              loading={isLoading}
              onPress={handleCreate}
              style={styles.button}
            />
          </View>
        </BottomModalContainer>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  button: {
    marginTop: 24,
    width: "100%",
  },
  container: {
    paddingHorizontal: 16,
  },
  flex: {
    flex: 1,
    justifyContent: "flex-end",
  },
  input: {
    marginTop: 16,
  },
})
