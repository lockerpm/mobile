import React, { FC, useState } from "react"
import { CommonActions } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { useAuthentication, useCipherHelper, useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { PolicyType } from "app/static/types"
import { Screen, Header, TextInput, Button } from "app/components/cores"
import { PasswordPolicyViolationsModal, PasswordStrength } from "app/components/utils"
import { StyleSheet, View } from "react-native"
import { useAppLocale } from "app/services/context"
import { SettingsScreenProps } from "app/navigators"

export const ChangeMasterPasswordScreen: FC<SettingsScreenProps<"changeMasterPassword">> = observer(
  ({ navigation }) => {
    const { translate } = useAppLocale()
    const { validateMasterPassword } = useHelper()
    const { getPasswordStrength, checkPasswordPolicy } = useCipherHelper()
    const { changeMasterPassword } = useAuthentication()
    const { user } = useStores()

    // -------------- PARAMS --------------

    const [isLoading, setIsLoading] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(-1)
    const [current, setCurrent] = useState("")
    const [newPass, setNewPass] = useState("")
    const [confirm, setConfirm] = useState("")
    const [hint, setHint] = useState("")

    const [showViolationModal, setShowViolationModal] = useState(false)
    const [violations, setViolations] = useState<string[]>([])

    // -------------- COMPUTED --------------

    const isError = !!newPass && !!confirm && newPass !== confirm
    const isHintError = !isError && !!newPass && hint === newPass
    const masterPasswordError = validateMasterPassword(newPass).error
    const isReady = !masterPasswordError && !isError && !!current && !!newPass && !!confirm

    // -------------- METHODS --------------

    const preparePassword = async () => {
      setIsLoading(true)
      const violatedItems = await checkPasswordPolicy(newPass, PolicyType.MASTER_PASSWORD_REQ)
      if (violatedItems.length) {
        setViolations(violatedItems)
        setShowViolationModal(true)
        setIsLoading(false)
        return
      }
      handleChangePassword()
    }

    const handleChangePassword = async () => {
      setIsLoading(true)

      const res = await changeMasterPassword(current, newPass, hint)
      if (res.kind === "ok") {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "login" }],
          }),
        )
      }
      setIsLoading(false)
    }

    // -------------- RENDER --------------

    return (
      <Screen
        preset="auto"
        padding
        safeAreaEdges={["bottom"]}
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            titleTx={"change_master_pass.title"}
          />
        }
        footer={
          <Button
            loading={isLoading}
            disabled={isLoading || !isReady}
            onPress={preparePassword}
            text={translate("common.save")}
            style={styles.save}
          />
        }
      >
        <View>
          <TextInput
            animated
            isPassword
            label={translate("change_master_pass.current")}
            value={current}
            onChangeText={setCurrent}
          />

          <TextInput
            isPassword
            animated
            label={translate("change_master_pass.new")}
            value={newPass}
            onChangeText={(text) => {
              setNewPass(text)
              const strength = getPasswordStrength(text)
              setPasswordStrength(strength ? strength.score : -1)
            }}
            isError={isError || !!masterPasswordError}
            helper={masterPasswordError || translate("common.password_not_match")}
          />

          {!!newPass && <PasswordStrength value={passwordStrength} style={{ marginTop: 8 }} />}

          <TextInput
            animated
            isPassword
            isError={isError}
            helper={translate("common.password_not_match")}
            label={translate("change_master_pass.confirm")}
            value={confirm}
            onChangeText={setConfirm}
          />

          <TextInput
            label={translate("create_master_pass.hint")}
            onChangeText={setHint}
            value={hint}
            isError={isHintError}
            helper={translate("create_master_pass.hint_error")}
            multiline
            numberOfLines={4}
            style={styles.mt30}
            containerStyle={styles.mv20}
          />

          <PasswordPolicyViolationsModal
            isOpen={showViolationModal}
            onClose={() => {
              setShowViolationModal(false)
            }}
            violations={violations}
            teamName={user.teams.length && user.teams[0]?.name}
            onConfirm={() => {
              setShowViolationModal(false)
            }}
            confirmText="Okay..."
          />
        </View>
      </Screen>
    )
  },
)

const styles = StyleSheet.create({
  mt30: { marginBottom: 30 },
  mv20: { marginVertical: 20 },
  save: {
    marginHorizontal: 20,
  },
})
