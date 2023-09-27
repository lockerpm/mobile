/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, useState } from 'react'
import { View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { Button, Header, Screen, Text, TextInput } from 'app/components/cores'
import { AppStackScreenProps } from 'app/navigators'
import { useAuthentication, useCipherHelper, useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { TrustedContact } from 'app/static/types'
import { translate } from 'app/i18n'
import { PasswordStrength } from 'app/components/utils'

export const TakeoverEAScreen: FC<AppStackScreenProps<'takeoverEA'>> = observer((props) => {
  const navigation = props.navigation
  const route = props.route

  const { colors } = useTheme()
  const { validateMasterPassword } = useHelper()
  const { getPasswordStrength } = useCipherHelper()
  const { updateNewMasterPasswordEA } = useAuthentication()

  const trustContact: TrustedContact = route.params.trusted
  const resetPW = route.params.reset_pw

  // -------------- PARAMS --------------

  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(-1)
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')

  // -------------- COMPUTED --------------

  const isError = !!newPass && !!confirm && newPass !== confirm
  const masterPasswordError = validateMasterPassword(newPass).error
  const isReady = !masterPasswordError && !isError && !!newPass && !!confirm

  // -------------- METHODS --------------

  const handleChangeMasterPW = async () => {
    // fetch enc key
    const res = await updateNewMasterPasswordEA(newPass, trustContact.email, trustContact.id)
    if (res.kind !== 'ok') return
    navigation.goBack()
  }

  const handleChangePW = async () => {
    // fetch enc key
    const res = await updateNewMasterPasswordEA(newPass, trustContact.email, trustContact.id, true)
    if (res.kind !== 'ok') return
    navigation.goBack()
  }

  // -------------- EFFECT --------------

  // -------------- RENDER --------------
  const renderResetMasterPW = () => (
    <View
      style={{
        paddingVertical: 16,
        backgroundColor: colors.background,
      }}
    >
      <Text text={translate('emergency_access.reset_master_pw_user', { name: ' ' })} />
      <Text preset="bold" text={trustContact.full_name} />

      <TextInput
        isPassword
        isError={isError || !!masterPasswordError}
        helper={masterPasswordError || translate('common.password_not_match')}
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
        isPassword
        isError={isError}
        helper={translate('common.password_not_match')}
        label={translate('change_master_pass.confirm')}
        value={confirm}
        onChangeText={setConfirm}
        style={{ marginBottom: 30, marginTop: 20 }}
      />

      <Button
        loading={isLoading}
        disabled={isLoading || !isReady}
        onPress={handleChangeMasterPW}
        text={translate('common.save')}
      />
    </View>
  )
  const renderResetLockerPW = () => (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: colors.background,
      }}
    >
      <Text preset="label" text={translate('emergency_access.reset_pw_user', { name: ' ' })} />
      <Text preset="bold" text={trustContact.full_name} />

      <TextInput
        isPassword
        isError={isError || !!masterPasswordError}
        helper={masterPasswordError || translate('common.password_not_match')}
        label={translate('emergency_access.change_pw.new')}
        value={newPass}
        onChangeText={(text) => {
          setNewPass(text)
          const strength = getPasswordStrength(text)
          setPasswordStrength(strength ? strength.score : -1)
        }}
      />

      {!!newPass && <PasswordStrength value={passwordStrength} style={{ marginTop: 15 }} />}

      <TextInput
        isPassword
        isError={isError}
        helper={translate('common.password_not_match')}
        label={translate('emergency_access.change_pw.confirm')}
        value={confirm}
        onChangeText={setConfirm}
        style={{ marginBottom: 30, marginTop: 20 }}
      />

      <Button
        loading={isLoading}
        disabled={isLoading || !isReady}
        onPress={handleChangePW}
        text={translate('common.save')}
      />
    </View>
  )

  return (
    <Screen
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
          title={
            resetPW
              ? translate('emergency_access.change_pw.title')
              : translate('change_master_pass.title')
          }
        />
      }
      contentContainerStyle={{ backgroundColor: colors.block, paddingHorizontal: 0 }}
    >
      {resetPW && renderResetLockerPW()}
      {!resetPW && renderResetMasterPW()}
    </Screen>
  )
})
