import React, { useState } from 'react'
import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { useAuthentication, useCipherHelper, useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { useStores } from 'app/models'
import { PolicyType } from 'app/static/types'
import { Screen, Header, TextInput, Button } from 'app/components/cores'
import { PasswordPolicyViolationsModal, PasswordStrength } from 'app/components/utils'
import { translate } from 'app/i18n'

export const ChangeMasterPasswordScreen = observer(() => {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { validateMasterPassword } = useHelper()
  const { getPasswordStrength, checkPasswordPolicy } = useCipherHelper()
  const { changeMasterPassword } = useAuthentication()
  const { user } = useStores()

  // -------------- PARAMS --------------

  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(-1)
  const [current, setCurrent] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [hint, setHint] = useState('')

  const [showViolationModal, setShowViolationModal] = useState(false)
  const [violations, setViolations] = useState<string[]>([])

  // -------------- COMPUTED --------------

  const isError = !!newPass && !!confirm && newPass !== confirm
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
    if (res.kind === 'ok') {
      navigation.navigate('login')
    }
    setIsLoading(false)
  }

  // -------------- RENDER --------------

  return (
    <Screen
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
          title={translate('change_master_pass.title')}
        />
      }
      backgroundColor={colors.background}
    >
      <View
        style={{
          paddingVertical: 16,
          marginTop: 16,
          backgroundColor: colors.background,
        }}
      >
        <TextInput
          animated
          isPassword
          label={translate('change_master_pass.current')}
          isError={isError || !!masterPasswordError}
          helper={masterPasswordError || translate('common.password_not_match')}
          value={current}
          onChangeText={setCurrent}
          style={{ marginBottom: 20 }}
        />

        <TextInput
          isPassword
          animated
          label={translate('change_master_pass.new')}
          value={newPass}
          onChangeText={(text) => {
            setNewPass(text)
            const strength = getPasswordStrength(text)
            setPasswordStrength(strength ? strength.score : -1)
          }}
        />

        {!!newPass && <PasswordStrength value={passwordStrength} style={{ marginTop: 15 }} />}

        <TextInput
          animated
          isPassword
          isError={isError}
          helper={translate('common.password_not_match')}
          label={translate('change_master_pass.confirm')}
          value={confirm}
          onChangeText={setConfirm}
          style={{ marginBottom: 20, marginTop: 20 }}
        />

        <TextInput
          label={translate('create_master_pass.hint')}
          onChangeText={setHint}
          value={hint}
          style={{ marginBottom: 30 }}
        />

        <Button
          loading={isLoading}
          disabled={isLoading || !isReady}
          onPress={preparePassword}
          text={translate('common.save')}
        />
      </View>

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
    </Screen>
  )
})
