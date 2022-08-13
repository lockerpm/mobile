import React, { useState } from "react"
import { View } from "react-native"
import { Layout, Button, Header, FloatingInput, PasswordStrength, Text } from "../../../../../../components"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { commonStyles } from "../../../../../../theme"
import { useMixins } from "../../../../../../services/mixins"
import { useCipherHelpersMixins } from "../../../../../../services/mixins/cipher/helpers"
import { useCipherAuthenticationMixins } from "../../../../../../services/mixins/cipher/authentication"
import { observer } from "mobx-react-lite"
import { TrustedContact } from "../../../../../../services/api"
import { PrimaryParamList } from "../../../../../../navigators"

type TakeoverScreenProp = RouteProp<PrimaryParamList, "takeoverEA">

export const TakeoverEAScreen = observer(() => {
  const navigation = useNavigation()
  const { translate, color, validateMasterPassword } = useMixins()
  const { getPasswordStrength } = useCipherHelpersMixins()
  const { updateNewMasterPasswordEA } = useCipherAuthenticationMixins()
  const route = useRoute<TakeoverScreenProp>()

  const trustContact: TrustedContact = route.params.trusted
  const resetPW = route.params.reset_pw

  // -------------- PARAMS --------------

  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(-1)
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')

  // -------------- COMPUTED --------------

  const isError = !!newPass && !!confirm && (newPass !== confirm)
  const masterPasswordError = validateMasterPassword(newPass).error
  const isReady = !masterPasswordError && !isError && !!newPass && !!confirm

  // -------------- METHODS --------------

  const handleChangeMasterPW = async () => {
    // fetch enc key
    const res = await updateNewMasterPasswordEA(newPass, trustContact.email, trustContact.id)
    if (res.kind !== "ok") return
    navigation.goBack()
  }

  const handleChangePW = async () => {
    // fetch enc key
    const res = await updateNewMasterPasswordEA(newPass, trustContact.email, trustContact.id)
    if (res.kind !== "ok") return
    navigation.goBack()
  }


  // -------------- EFFECT --------------

  // -------------- RENDER --------------
  const renderResetMasterPW = () => (
    <View style={[commonStyles.GRAY_SCREEN_SECTION, {
      paddingVertical: 16,
      backgroundColor: color.background
    }]}>

      <Text text={translate('emergency_access.reset_master_pw_user', { name: trustContact.full_name })} />

      <FloatingInput
        isPassword
        isInvalid={isError || !!masterPasswordError}
        errorText={masterPasswordError || translate('common.password_not_match')}
        label={translate('change_master_pass.new')}
        value={newPass}
        onChangeText={(text) => {
          setNewPass(text)
          const strength = getPasswordStrength(text)
          setPasswordStrength(strength ? strength.score : -1)
        }}
      />

      {
        !!newPass && (
          <PasswordStrength value={passwordStrength} style={{ marginTop: 15 }} />
        )
      }

      <FloatingInput
        isPassword
        isInvalid={isError}
        errorText={translate('common.password_not_match')}
        label={translate('change_master_pass.confirm')}
        value={confirm}
        onChangeText={setConfirm}
        style={{ marginBottom: 30, marginTop: 20 }}
      />

      <Button
        isLoading={isLoading}
        isDisabled={isLoading || !isReady}
        onPress={handleChangeMasterPW}
        text={translate('common.save')}
      />
    </View>
  )
  const renderResetLockerPW = () => (
    <View style={[commonStyles.GRAY_SCREEN_SECTION, {
      paddingVertical: 16,
      backgroundColor: color.background
    }]}>

      <Text text={translate('emergency_access.reset_pw_user', { name: trustContact.full_name })} />

      <FloatingInput
        isPassword
        isInvalid={isError || !!masterPasswordError}
        errorText={masterPasswordError || translate('common.password_not_match')}
        label={translate('emergency_access.change_pw.new')}
        value={newPass}
        onChangeText={(text) => {
          setNewPass(text)
          const strength = getPasswordStrength(text)
          setPasswordStrength(strength ? strength.score : -1)
        }}
      />

      {
        !!newPass && (
          <PasswordStrength value={passwordStrength} style={{ marginTop: 15 }} />
        )
      }

      <FloatingInput
        isPassword
        isInvalid={isError}
        errorText={translate('common.password_not_match')}
        label={translate('emergency_access.change_pw.confirm')}
        value={confirm}
        onChangeText={setConfirm}
        style={{ marginBottom: 30, marginTop: 20 }}
      />

      <Button
        isLoading={isLoading}
        isDisabled={isLoading || !isReady}
        onPress={handleChangePW}
        text={translate('common.save')}
      />
    </View>
  )

  return (
    <Layout
      header={(
        <Header
          goBack={() => navigation.goBack()}
          title={resetPW ? translate('emergency_access.change_pw.title') : translate('change_master_pass.title')}
          right={(<View style={{ width: 30 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      {
        resetPW && renderResetLockerPW()
      }
      {
        !resetPW && renderResetMasterPW()
      }
    </Layout>
  )
})
