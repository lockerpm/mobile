import { FC, useRef, useState } from "react"
import { StyleSheet, View } from "react-native"
import { CommonActions } from "@react-navigation/native"
import { observer } from "mobx-react-lite"

import { Screen, Header, TextInput, Button } from "app/components/cores"
import { PasswordStrength } from "app/components/utils"
import { SettingsScreenProps } from "app/navigators"
import { useAuthentication, useCipherHelper, useHelper } from "app/services/hook"
import { MPEncodeConfig } from "app/static/types"

import { useAppLocale } from "@/i18n"
import { useCoreService } from "@/services/coreService"

export const ChangeMasterPasswordScreen: FC<SettingsScreenProps<"changeMasterPassword">> = observer(
  ({ navigation }) => {
    const { translate } = useAppLocale()
    const { validateMasterPassword } = useHelper()
    const { getPasswordStrength } = useCipherHelper()
    const { changeMasterPassword } = useAuthentication()

    const { userService } = useCoreService()

    const encodeConfig = useRef<MPEncodeConfig>({
      kdf: userService.getKdf(),
      kdf_iterations: userService.getKdfIterations(),
      kdf_memory: userService.getKdfMemory(),
      kdf_parallelism: userService.getKdfParallelism(),
      kdf_version: userService.getKdfVersion(),
    })

    // -------------- PARAMS --------------

    const [isLoading, setIsLoading] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(-1)
    const [current, setCurrent] = useState("")
    const [newPass, setNewPass] = useState("")
    const [confirm, setConfirm] = useState("")
    const [hint, setHint] = useState("")

    // -------------- COMPUTED --------------

    const isError = !!newPass && !!confirm && newPass !== confirm
    const isHintError = !isError && !!newPass && hint === newPass
    const masterPasswordError = validateMasterPassword(newPass).error
    const isReady = !masterPasswordError && !isError && !!current && !!newPass && !!confirm

    // -------------- METHODS --------------

    const preparePassword = async () => {
      setIsLoading(true)
      handleChangePassword()
    }

    const handleChangePassword = async () => {
      setIsLoading(true)

      const res = await changeMasterPassword(current, newPass, hint, encodeConfig.current)
      if (res.kind === "ok") {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "init" }],
          })
        )
      }
      setIsLoading(false)
    }

    // -------------- RENDER --------------

    return (
      <Screen
        preset="auto"
        safeAreaEdges={["bottom"]}
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            titleTx={"change_master_pass:title"}
          />
        }
        footer={
          <Button
            loading={isLoading}
            disabled={isLoading || !isReady}
            onPress={preparePassword}
            tx={"common:save"}
            style={styles.save}
          />
        }
        keyboardOffset={16}
        contentContainerStyle={styles.ph16}
      >
        <View>
          <TextInput
            animated
            isPassword
            labelTx={"change_master_pass:current"}
            value={current}
            onChangeText={setCurrent}
          />

          <TextInput
            isPassword
            animated
            labelTx={"change_master_pass:new"}
            value={newPass}
            onChangeText={(text) => {
              setNewPass(text)
              const strength = getPasswordStrength(text)
              setPasswordStrength(strength ? strength.score : -1)
            }}
            isError={isError || !!masterPasswordError}
            helper={masterPasswordError || translate("common:password_not_match")}
          />

          {!!newPass && <PasswordStrength value={passwordStrength} style={styles.mt8} />}

          <TextInput
            animated
            isPassword
            isError={isError}
            helperTx={"common:password_not_match"}
            labelTx={"change_master_pass:confirm"}
            value={confirm}
            onChangeText={setConfirm}
          />

          <TextInput
            labelTx={"create_master_pass:hint"}
            onChangeText={setHint}
            value={hint}
            isError={isHintError}
            helperTx={"create_master_pass:hint_error"}
            multiline
            numberOfLines={4}
            style={styles.mt30}
            containerStyle={styles.mv20}
          />
        </View>
      </Screen>
    )
  }
)

const styles = StyleSheet.create({
  mt16: { marginTop: 16 },
  mt30: { marginBottom: 30 },
  mt8: { marginTop: 8 },
  mv20: { marginVertical: 20 },
  ph16: {
    paddingHorizontal: 16,
  },
  save: {
    marginHorizontal: 20,
  },
})
