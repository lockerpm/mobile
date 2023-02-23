import React, { useState } from 'react'
import { View } from 'react-native'
import {
  Layout,
  Button,
  Header,
  FloatingInput,
  PasswordStrength,
  PasswordPolicyViolationsModal,
} from '../../../../components'
import { useNavigation } from '@react-navigation/native'
import { commonStyles } from '../../../../theme'
import { useMixins } from '../../../../services/mixins'
import { useCipherHelpersMixins } from '../../../../services/mixins/cipher/helpers'
import { useCipherAuthenticationMixins } from '../../../../services/mixins/cipher/authentication'
import { PolicyType } from '../../../../config/types'
import { observer } from 'mobx-react-lite'
import { useStores } from '../../../../models'

export const ChangeMasterPasswordScreen = observer(() => {
  const navigation = useNavigation()
  const { translate, color, validateMasterPassword } = useMixins()
  const { getPasswordStrength, checkPasswordPolicy } = useCipherHelpersMixins()
  const { changeMasterPassword } = useCipherAuthenticationMixins()
  const { user } = useStores()

  // -------------- PARAMS --------------

  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(-1)
  const [current, setCurrent] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')

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
    const res = await changeMasterPassword(current, newPass)
    if (res.kind === 'ok') {
      navigation.navigate('loginSelect')
    }
    setIsLoading(false)
  }

  // -------------- RENDER --------------

  return (
    <Layout
      header={
        <Header
          goBack={() => navigation.goBack()}
          title={translate('change_master_pass.title')}
          right={<View style={{ width: 30 }} />}
        />
      }
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <View
        style={[
          commonStyles.GRAY_SCREEN_SECTION,
          {
            paddingVertical: 16,
            backgroundColor: color.background,
          },
        ]}
      >
        <FloatingInput
          isPassword
          label={translate('change_master_pass.current')}
          value={current}
          onChangeText={setCurrent}
          style={{ marginBottom: 20 }}
        />

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

        {!!newPass && <PasswordStrength value={passwordStrength} style={{ marginTop: 15 }} />}

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
          onPress={preparePassword}
          text={translate('common.save')}
        />
      </View>

      {/* Violations modal */}
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
      {/* Violations modal end */}
    </Layout>
  )
})
